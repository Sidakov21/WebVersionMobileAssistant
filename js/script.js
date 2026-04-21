const palette = {
  green: '#4fc35c',
  blue: '#2e9df0',
  orange: '#ffab1f',
  purple: '#9c27b0',
  red: '#ff4a3f'
};

const subgoalColorOptions = [palette.green, palette.blue, palette.orange, palette.purple, palette.red];
const modalState = { current: null, selectedSubgoalColor: palette.green };

let state = loadAppState();
let selectedGoalId = state.goals[0]?.id ?? null;
let selectedStatus = 'active';
let selectedSubgoal = 'Все';

function saveState() {
  saveAppState(state);
}

function avgProgress(goal) {
  return Math.round(goal.radar.reduce((sum, value) => sum + value, 0) / goal.radar.length);
}

function getSelectedGoal() {
  return state.goals.find((goal) => goal.id === selectedGoalId);
}

function drawRadar(canvas, values, color = palette.green) {
  const ctx = canvas.getContext('2d');
  const labelsCount = values.length;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 + 4;
  const radius = 55;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(162,176,184,0.25)';
  ctx.lineWidth = 1;

  for (let ring = 1; ring <= 4; ring += 1) {
    ctx.beginPath();
    for (let i = 0; i < labelsCount; i += 1) {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / labelsCount;
      const x = cx + Math.cos(angle) * ((radius * ring) / 4);
      const y = cy + Math.sin(angle) * ((radius * ring) / 4);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((value, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / labelsCount;
    const currentRadius = (radius * value) / 100;
    const x = cx + Math.cos(angle) * currentRadius;
    const y = cy + Math.sin(angle) * currentRadius;
    index ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.closePath();
  ctx.stroke();
}

function renderDropdown() {
  const menu = document.getElementById('goalDropdown');
  menu.innerHTML = state.goals
    .map((goal) => `<li><button data-goal-id="${goal.id}">${goal.name}</button></li>`)
    .join('');

  menu.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      selectedGoalId = button.dataset.goalId;
      selectedSubgoal = 'Все';
      menu.hidden = true;
      document.getElementById('goalDropdownBtn').setAttribute('aria-expanded', 'false');
      renderAll();
    });
  });
}

function goToGoal(goalId = selectedGoalId) {
  if (!goalId) return;
  window.location.href = `./goal.html?goalId=${encodeURIComponent(goalId)}`;
}

function renderRadars() {
  const row = document.getElementById('radarsRow');
  const selectedGoal = getSelectedGoal();
  const remaining = state.goals.filter((goal) => goal.id !== selectedGoalId);
  const positioned = [
    { goal: remaining[0], slot: 'left' },
    { goal: selectedGoal, slot: 'center' },
    { goal: remaining[1], slot: 'right' }
  ].filter((item) => item.goal);

  row.innerHTML = positioned
    .map(({ goal, slot }) => {
      const isSelected = goal.id === selectedGoalId;
      return `
        <button class="radar-node ${slot} ${isSelected ? 'is-selected' : ''}" data-goal-id="${goal.id}">
          <canvas width="180" height="130"></canvas>
          <div class="radar-title">${goal.name}</div>
          <div class="radar-progress">${avgProgress(goal)}%</div>
        </button>
      `;
    })
    .join('');

  row.querySelectorAll('.radar-node').forEach((card) => {
    const goal = state.goals.find((item) => item.id === card.dataset.goalId);
    drawRadar(card.querySelector('canvas'), goal.radar, goal.id === selectedGoalId ? palette.green : '#5ea8c4');
    card.addEventListener('click', () => goToGoal(card.dataset.goalId));
  });
}

function renderAnalytics() {
  const goal = getSelectedGoal();
  if (!goal) return;

  document.getElementById('selectedGoalName').textContent = goal.name;
  document.getElementById('selectedGoalProgress').textContent = `Общий прогресс: ${avgProgress(goal)}%`;
  document.getElementById('goToGoalBtn').onclick = () => goToGoal(goal.id);

  document.getElementById('activityList').innerHTML = goal.activities.length
    ? goal.activities
        .map((item) => {
          const progress = item.total ? Math.round((item.done / item.total) * 100) : 0;
          return `
            <div class="activity-row">
              <div class="activity-head">
                <span>${item.name}</span>
                <span>${item.done} действий</span>
              </div>
              <div class="progress-track"><div class="progress-fill" style="width:${progress}%; background:${item.color}"></div></div>
            </div>`;
        })
        .join('')
    : '<p>У этой цели пока нет подцелей и активности.</p>';
}

function filteredTasks() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const sortBy = document.getElementById('sortSelect').value;

  let list = state.tasks.filter((task) => task.goalId === selectedGoalId && task.status === selectedStatus);
  if (selectedSubgoal !== 'Все') list = list.filter((task) => task.subgoal === selectedSubgoal);
  if (query) list = list.filter((task) => task.name.toLowerCase().includes(query) || task.subgoal.toLowerCase().includes(query));

  if (sortBy === 'az') list.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  if (sortBy === 'progress') list.sort((a, b) => b.progress - a.progress);
  if (sortBy === 'new') list.sort((a, b) => b.createdOrder - a.createdOrder);

  return list;
}

function renderSubgoalFilters() {
  const goal = getSelectedGoal();
  if (!goal) return;
  const filters = ['Все', ...goal.subgoals.map((subgoal) => subgoal.name)];
  const container = document.getElementById('subgoalFilters');

  if (!filters.includes(selectedSubgoal)) selectedSubgoal = 'Все';

  container.innerHTML = filters
    .map((label) => `<button class="chip" data-active="${selectedSubgoal === label}" data-subgoal="${label}">${label}</button>`)
    .join('');

  container.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      selectedSubgoal = chip.dataset.subgoal;
      renderTasksArea();
    });
  });
}

function taskCard(task) {
  return `
    <article class="task-item ${task.status}">
      <div class="task-top">
        <h4 class="task-name">${task.name}</h4>
        <div class="task-percent" style="background:${task.color}33; color:${task.color}">${task.progress}%</div>
      </div>
      <p class="goal-card-note">${task.note || 'Без заметки'}</p>
      <div class="tag-date">
        <span class="tag" style="background:${task.color}26; color:${task.color}">${task.subgoal}</span>
        <span>${task.date}</span>
      </div>
    </article>`;
}

function renderTasksArea() {
  renderSubgoalFilters();
  const tasks = filteredTasks();
  const total = state.tasks.filter((task) => task.goalId === selectedGoalId).length;
  const done = state.tasks.filter((task) => task.goalId === selectedGoalId && task.status === 'completed').length;

  document.getElementById('totalTasks').textContent = `Всего задач: ${total}`;
  document.getElementById('doneTasks').textContent = `Выполнено: ${done}`;
  document.getElementById('tasksList').innerHTML = tasks.length ? tasks.map(taskCard).join('') : '<p>Нет задач по выбранным фильтрам.</p>';

  document.querySelectorAll('.status-btn').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.status === selectedStatus);
  });
}

function renderColorPicker() {
  const picker = document.getElementById('subgoalColorPicker');
  picker.innerHTML = subgoalColorOptions
    .map((color) => {
      const isSelected = modalState.selectedSubgoalColor === color;
      return `<button type="button" class="color-option ${isSelected ? 'is-selected' : ''}" data-color="${color}" style="background:${color}" aria-label="Выбрать цвет ${color}"></button>`;
    })
    .join('');

  picker.querySelectorAll('.color-option').forEach((button) => {
    button.addEventListener('click', () => {
      modalState.selectedSubgoalColor = button.dataset.color;
      renderColorPicker();
    });
  });
}

function updateGoalSubmitState() {
  document.getElementById('submitGoalBtn').disabled = document.getElementById('goalNameInput').value.trim().length === 0;
}

function updateSubgoalSubmitState() {
  document.getElementById('submitSubgoalBtn').disabled = document.getElementById('subgoalNameInput').value.trim().length === 0;
}

function openModal(name) {
  const overlay = document.getElementById('modalOverlay');
  document.getElementById('goalModal').hidden = name !== 'goal';
  document.getElementById('subgoalModal').hidden = name !== 'subgoal';
  overlay.hidden = false;
  document.body.classList.add('modal-open');
  modalState.current = name;

  if (name === 'goal') {
    document.getElementById('goalForm').reset();
    updateGoalSubmitState();
  }

  if (name === 'subgoal') {
    document.getElementById('subgoalForm').reset();
    modalState.selectedSubgoalColor = palette.green;
    renderColorPicker();
    updateSubgoalSubmitState();
  }
}

function closeModal() {
  document.getElementById('modalOverlay').hidden = true;
  document.getElementById('goalModal').hidden = true;
  document.getElementById('subgoalModal').hidden = true;
  document.body.classList.remove('modal-open');
  modalState.current = null;
}

function createGoal(name, description) {
  const newGoal = {
    id: `goal-${state.nextGoalId++}`,
    name,
    description,
    radar: [0, 0, 0, 0, 0],
    subgoals: [],
    activities: []
  };

  state.goals.unshift(newGoal);
  selectedGoalId = newGoal.id;
  selectedSubgoal = 'Все';
  selectedStatus = 'active';
  saveState();
}

function createSubgoal(name, color) {
  const goal = getSelectedGoal();
  goal.subgoals.push({ name, color });
  goal.activities.push({ name, done: 0, total: 0, color });

  state.tasks.unshift({
    id: state.nextTaskId++,
    goalId: goal.id,
    name,
    subgoal: name,
    progress: 0,
    date: new Date().toLocaleDateString('ru-RU'),
    status: 'active',
    createdOrder: state.nextTaskId,
    color,
    note: ''
  });

  saveState();
}

function renderAll() {
  state = loadAppState();
  if (!state.goals.find((goal) => goal.id === selectedGoalId)) {
    selectedGoalId = state.goals[0]?.id ?? null;
  }
  renderDropdown();
  renderRadars();
  renderAnalytics();
  renderTasksArea();
}

function bindUi() {
  const dropButton = document.getElementById('goalDropdownBtn');
  const menu = document.getElementById('goalDropdown');
  const overlay = document.getElementById('modalOverlay');

  dropButton.addEventListener('click', () => {
    const shouldOpen = menu.hidden;
    menu.hidden = !shouldOpen;
    dropButton.setAttribute('aria-expanded', String(shouldOpen));
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.goal-dropdown-wrap')) {
      menu.hidden = true;
      dropButton.setAttribute('aria-expanded', 'false');
    }
  });

  document.getElementById('searchInput').addEventListener('input', renderTasksArea);
  document.getElementById('sortSelect').addEventListener('change', renderTasksArea);

  document.querySelectorAll('.status-btn').forEach((button) => {
    button.addEventListener('click', () => {
      selectedStatus = button.dataset.status;
      renderTasksArea();
    });
  });

  document.getElementById('openGoalModalBtn').addEventListener('click', () => openModal('goal'));
  document.getElementById('openSubgoalModalBtn').addEventListener('click', () => openModal('subgoal'));

  document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModal));
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modalState.current) closeModal(); });

  document.getElementById('goalNameInput').addEventListener('input', updateGoalSubmitState);
  document.getElementById('subgoalNameInput').addEventListener('input', updateSubgoalSubmitState);

  document.getElementById('goalForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('goalNameInput').value.trim();
    const description = document.getElementById('goalDescriptionInput').value.trim();
    if (!name) return;
    createGoal(name, description);
    closeModal();
    renderAll();
  });

  document.getElementById('subgoalForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('subgoalNameInput').value.trim();
    if (!name) return;
    createSubgoal(name, modalState.selectedSubgoalColor);
    selectedSubgoal = name;
    closeModal();
    renderAll();
  });

  renderColorPicker();
}

bindUi();
renderAll();

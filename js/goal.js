const palette = {
  green: '#4fc35c',
  blue: '#2e9df0',
  orange: '#ffab1f',
  purple: '#9c27b0',
  red: '#ff4a3f'
};

const goalPageState = {
  goalId: new URLSearchParams(window.location.search).get('goalId'),
  sort: 'new',
  subgoal: 'Все',
  editingTaskId: null,
  modal: null
};

let state = loadAppState();

function saveState() {
  saveAppState(state);
}

function getGoal() {
  return state.goals.find((goal) => goal.id === goalPageState.goalId) ?? state.goals[0] ?? null;
}

function getGoalTasks() {
  const goal = getGoal();
  if (!goal) return [];
  return state.tasks.filter((task) => task.goalId === goal.id);
}

function getSubgoalColor(goal, subgoalName) {
  return goal.subgoals.find((subgoal) => subgoal.name === subgoalName)?.color ?? palette.blue;
}

function applyTaskFilters(tasks) {
  const query = document.getElementById('goalSearchInput').value.trim().toLowerCase();
  let list = [...tasks];

  if (goalPageState.subgoal !== 'Все') {
    list = list.filter((task) => task.subgoal === goalPageState.subgoal);
  }

  if (query) {
    list = list.filter((task) => task.name.toLowerCase().includes(query) || (task.note || '').toLowerCase().includes(query));
  }

  if (goalPageState.sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  if (goalPageState.sort === 'progress') list.sort((a, b) => b.progress - a.progress);
  if (goalPageState.sort === 'new') list.sort((a, b) => b.createdOrder - a.createdOrder);

  return list;
}

function taskCard(task) {
  const note = task.note?.trim() ? task.note.trim() : 'Без заметки';
  const completedClass = task.status === 'completed' ? 'is-completed' : '';

  return `
    <button class="goal-task-card ${completedClass}" data-task-id="${task.id}">
      <div class="goal-card-top">
        <div>
          <h3 class="goal-card-title">${task.name}</h3>
          <p class="goal-card-note">${note}</p>
        </div>
        <div class="goal-card-progress" style="background:${task.color}26; color:${task.color}">${task.progress}%</div>
      </div>
      <div class="goal-card-meta">
        <span class="goal-card-tag" style="background:${task.color}26; color:${task.color}">${task.subgoal}</span>
        <span>${task.date}</span>
      </div>
    </button>
  `;
}

function bindTaskCards() {
  document.querySelectorAll('.goal-task-card').forEach((card) => {
    card.addEventListener('click', () => openEditModal(Number(card.dataset.taskId)));
  });
}

function renderFilters(goal) {
  const container = document.getElementById('goalSubgoalFilters');
  const filters = ['Все', ...goal.subgoals.map((subgoal) => subgoal.name)];

  if (!filters.includes(goalPageState.subgoal)) goalPageState.subgoal = 'Все';

  container.innerHTML = filters
    .map((name) => {
      const active = goalPageState.subgoal === name ? 'is-active' : '';
      const color = name === 'Все' ? '' : `style="border-color:${getSubgoalColor(goal, name)}55;color:${getSubgoalColor(goal, name)}"`;
      return `<button class="goal-filter-chip ${active}" data-subgoal="${name}" ${color}>${name}</button>`;
    })
    .join('');

  container.querySelectorAll('.goal-filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      goalPageState.subgoal = chip.dataset.subgoal;
      renderGoalPage();
    });
  });
}

function renderSortButtons() {
  document.querySelectorAll('.sort-chip').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.sort === goalPageState.sort);
  });
}

function renderTaskStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === 'completed').length;
  const active = tasks.filter((task) => task.status === 'active').length;
  const completed = tasks.filter((task) => task.status === 'completed').length;

  document.getElementById('goalTotalTasks').textContent = `Всего задач: ${total}`;
  document.getElementById('goalDoneTasks').textContent = `Выполнено: ${done}`;
  document.getElementById('goalActiveCount').textContent = `${active} шт.`;
  document.getElementById('goalCompletedCount').textContent = `${completed} шт.`;
}

function renderTaskGroups(tasks) {
  const activeTasks = applyTaskFilters(tasks.filter((task) => task.status === 'active'));
  const completedTasks = applyTaskFilters(tasks.filter((task) => task.status === 'completed'));

  document.getElementById('goalActiveTasks').innerHTML = activeTasks.length
    ? activeTasks.map(taskCard).join('')
    : '<div class="goal-empty-state">Активных задач нет.</div>';

  document.getElementById('goalCompletedTasks').innerHTML = completedTasks.length
    ? completedTasks.map(taskCard).join('')
    : '<div class="goal-empty-state">Завершённых задач нет.</div>';

  bindTaskCards();
}

function populateSubgoalSelects(goal) {
  const options = goal.subgoals.length
    ? goal.subgoals.map((subgoal) => `<option value="${subgoal.name}">${subgoal.name}</option>`).join('')
    : '<option value="">Нет подцелей</option>';

  document.getElementById('taskSubgoalSelect').innerHTML = options;
  document.getElementById('taskEditSubgoalSelect').innerHTML = options;
}

function renderGoalPage() {
  state = loadAppState();
  const goal = getGoal();
  if (!goal) return;

  goalPageState.goalId = goal.id;
  document.getElementById('goalPageTitle').textContent = goal.name;
  document.getElementById('goalPageSubtitle').textContent = goal.description || 'Детальный просмотр цели и всех задач';

  populateSubgoalSelects(goal);
  renderFilters(goal);
  renderSortButtons();
  const tasks = getGoalTasks();
  renderTaskStats(tasks);
  renderTaskGroups(tasks);
  updateTaskSubmitState();
}

function updateTaskSubmitState() {
  document.getElementById('submitTaskBtn').disabled = document.getElementById('taskNameInput').value.trim().length === 0;
}

function openGoalModal(name) {
  const overlay = document.getElementById('goalModalOverlay');
  document.getElementById('taskCreateModal').hidden = name !== 'create';
  document.getElementById('taskEditModal').hidden = name !== 'edit';
  overlay.hidden = false;
  document.body.classList.add('modal-open');
  goalPageState.modal = name;
}

function closeGoalModal() {
  document.getElementById('goalModalOverlay').hidden = true;
  document.getElementById('taskCreateModal').hidden = true;
  document.getElementById('taskEditModal').hidden = true;
  document.body.classList.remove('modal-open');
  goalPageState.modal = null;
  goalPageState.editingTaskId = null;
}

function openCreateModal() {
  const goal = getGoal();
  if (!goal || !goal.subgoals.length) {
    alert('Сначала добавь хотя бы одну подцель на главной странице.');
    return;
  }

  document.getElementById('taskCreateForm').reset();
  populateSubgoalSelects(goal);
  updateTaskSubmitState();
  openGoalModal('create');
}

function openEditModal(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  const goal = getGoal();
  if (!task || !goal) return;

  goalPageState.editingTaskId = taskId;
  populateSubgoalSelects(goal);
  document.getElementById('taskEditNameInput').value = task.name;
  document.getElementById('taskEditSubgoalSelect').value = task.subgoal;
  document.getElementById('taskEditNoteInput').value = task.note || '';
  document.getElementById('taskDoneCheckbox').checked = task.status === 'completed';
  openGoalModal('edit');
}

function createTask(name, subgoal, note) {
  const goal = getGoal();
  if (!goal) return;

  state.tasks.unshift({
    id: state.nextTaskId++,
    goalId: goal.id,
    name,
    subgoal,
    progress: 0,
    date: new Date().toLocaleDateString('ru-RU'),
    status: 'active',
    createdOrder: state.nextTaskId,
    color: getSubgoalColor(goal, subgoal),
    note: note.trim()
  });

  saveState();
}

function updateTask(taskId, updates) {
  const task = state.tasks.find((item) => item.id === taskId);
  const goal = getGoal();
  if (!task || !goal) return;

  Object.assign(task, updates);
  task.color = getSubgoalColor(goal, task.subgoal);
  task.progress = task.status === 'completed' ? 100 : 0;
  saveState();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((item) => item.id !== taskId);
  saveState();
}

function bindUi() {
  document.getElementById('backToIndexBtn').addEventListener('click', () => {
    window.location.href = './index.html';
  });

  document.getElementById('refreshGoalPageBtn').addEventListener('click', renderGoalPage);
  document.getElementById('goalSearchInput').addEventListener('input', renderGoalPage);
  document.getElementById('openTaskModalBtn').addEventListener('click', openCreateModal);
  document.getElementById('taskNameInput').addEventListener('input', updateTaskSubmitState);

  document.querySelectorAll('.sort-chip').forEach((button) => {
    button.addEventListener('click', () => {
      goalPageState.sort = button.dataset.sort;
      renderGoalPage();
    });
  });

  document.querySelectorAll('[data-close-goal-modal]').forEach((button) => {
    button.addEventListener('click', closeGoalModal);
  });

  document.getElementById('goalModalOverlay').addEventListener('click', (event) => {
    if (event.target.id === 'goalModalOverlay') closeGoalModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && goalPageState.modal) closeGoalModal();
  });

  document.getElementById('taskCreateForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('taskNameInput').value.trim();
    const subgoal = document.getElementById('taskSubgoalSelect').value;
    const note = document.getElementById('taskNoteInput').value;
    if (!name || !subgoal) return;
    createTask(name, subgoal, note);
    closeGoalModal();
    renderGoalPage();
  });

  document.getElementById('taskEditForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if (goalPageState.editingTaskId == null) return;

    updateTask(goalPageState.editingTaskId, {
      name: document.getElementById('taskEditNameInput').value.trim(),
      subgoal: document.getElementById('taskEditSubgoalSelect').value,
      note: document.getElementById('taskEditNoteInput').value.trim(),
      status: document.getElementById('taskDoneCheckbox').checked ? 'completed' : 'active'
    });

    closeGoalModal();
    renderGoalPage();
  });

  document.getElementById('deleteTaskBtn').addEventListener('click', () => {
    if (goalPageState.editingTaskId == null) return;
    deleteTask(goalPageState.editingTaskId);
    closeGoalModal();
    renderGoalPage();
  });
}

bindUi();
renderGoalPage();

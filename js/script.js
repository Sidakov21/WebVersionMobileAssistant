const palette = {
  green: '#4fc35c',
  blue: '#2e9df0',
  red: '#ff4a3f',
  orange: '#ffab1f'
};

const goals = [
  {
    id: 'goal-1',
    name: 'Цель 1',
    radar: [66, 66, 75, 50, 100],
    subgoals: ['Подцель 1', 'Подцель 2', 'Подцель 3', 'Подцель 4', 'Подцель 5'],
    activities: [
      { name: 'Подцель 1', done: 2, total: 3, color: palette.green },
      { name: 'Подцель 2', done: 2, total: 3, color: palette.green },
      { name: 'Подцель 3', done: 3, total: 4, color: palette.blue },
      { name: 'Подцель 4', done: 1, total: 2, color: palette.red },
      { name: 'Подцель 5', done: 1, total: 1, color: palette.orange }
    ]
  },
  {
    id: 'goal-2',
    name: 'Изучение Kotlin',
    radar: [82, 73, 67, 54, 39],
    subgoals: ['Подцель 1', 'Подцель 2', 'Подцель 3'],
    activities: [
      { name: 'Синтаксис', done: 4, total: 5, color: palette.green },
      { name: 'ООП', done: 3, total: 4, color: palette.blue },
      { name: 'Android', done: 2, total: 4, color: palette.orange }
    ]
  },
  {
    id: 'goal-3',
    name: 'Физическое развитие',
    radar: [40, 64, 52, 68, 70],
    subgoals: ['Кардио', 'Сон', 'Питание'],
    activities: [
      { name: 'Кардио', done: 2, total: 5, color: palette.red },
      { name: 'Сон', done: 4, total: 6, color: palette.blue },
      { name: 'Питание', done: 5, total: 7, color: palette.green }
    ]
  }
];

const allTasks = [
  { id: 1, goalId: 'goal-1', name: 'Задача 3.4', subgoal: 'Подцель 3', progress: 0, date: '17.02.2026', status: 'active', createdOrder: 8, color: palette.blue },
  { id: 2, goalId: 'goal-1', name: 'Задача 3.2', subgoal: 'Подцель 3', progress: 0, date: '17.02.2026', status: 'active', createdOrder: 7, color: palette.blue },
  { id: 3, goalId: 'goal-1', name: 'Задача 1.3', subgoal: 'Подцель 1', progress: 0, date: '17.02.2026', status: 'active', createdOrder: 6, color: palette.green },
  { id: 4, goalId: 'goal-1', name: 'Подцель 5', subgoal: 'Подцель 5', progress: 0, date: '17.02.2026', status: 'active', createdOrder: 5, color: palette.orange },
  { id: 5, goalId: 'goal-1', name: 'Задача 2.2', subgoal: 'Подцель 2', progress: 100, date: '17.02.2026', status: 'completed', createdOrder: 4, color: palette.green },
  { id: 6, goalId: 'goal-1', name: 'Задача 2.1', subgoal: 'Подцель 2', progress: 100, date: '17.02.2026', status: 'completed', createdOrder: 3, color: palette.green },
  { id: 7, goalId: 'goal-2', name: 'Сделать mini-проект', subgoal: 'Подцель 3', progress: 70, date: '14.03.2026', status: 'active', createdOrder: 2, color: palette.orange },
  { id: 8, goalId: 'goal-2', name: 'Пройти Kotlin Koans', subgoal: 'Подцель 1', progress: 100, date: '10.03.2026', status: 'completed', createdOrder: 1, color: palette.green }
];

let selectedGoalId = goals[0].id;
let selectedStatus = 'active';
let selectedSubgoal = 'Все';

function avgProgress(goal) {
  return Math.round(goal.radar.reduce((a, v) => a + v, 0) / goal.radar.length);
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

  for (let ring = 1; ring <= 4; ring++) {
    ctx.beginPath();
    for (let i = 0; i < labelsCount; i++) {
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
  values.forEach((value, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / labelsCount;
    const r = (radius * value) / 100;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.closePath();
  ctx.stroke();
}

function renderDropdown() {
  const menu = document.getElementById('goalDropdown');
  menu.innerHTML = goals
    .map((g) => `<li><button data-goal-id="${g.id}">${g.name}</button></li>`)
    .join('');

  menu.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedGoalId = btn.dataset.goalId;
      menu.hidden = true;
      document.getElementById('goalDropdownBtn').setAttribute('aria-expanded', 'false');
      renderAll();
    });
  });
}

function renderRadars() {
  const row = document.getElementById('radarsRow');
  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId);
  const remaining = goals.filter((goal) => goal.id !== selectedGoalId);
  const positioned = [
    { goal: remaining[0], slot: 'left' },
    { goal: selectedGoal, slot: 'center' },
    { goal: remaining[1], slot: 'right' }
  ].filter((item) => item.goal);

  row.innerHTML = positioned
    .map(({ goal, slot }) => {
      const selected = goal.id === selectedGoalId;
      return `
        <button class="radar-node ${slot} ${selected ? 'is-selected' : ''}" data-goal-id="${goal.id}">
          <canvas width="180" height="130"></canvas>
          <div class="radar-title">${goal.name}</div>
          <div class="radar-progress">${avgProgress(goal)}%</div>
        </button>
      `;
    })
    .join('');

  row.querySelectorAll('.radar-node').forEach((card) => {
    const goal = goals.find((item) => item.id === card.dataset.goalId);
    drawRadar(card.querySelector('canvas'), goal.radar, goal.id === selectedGoalId ? palette.green : '#5ea8c4');
    card.addEventListener('click', () => {
      selectedGoalId = card.dataset.goalId;
      selectedSubgoal = 'Все';
      renderAll();
    });
  });
}

function renderAnalytics() {
  const goal = goals.find((g) => g.id === selectedGoalId);
  document.getElementById('selectedGoalName').textContent = goal.name;
  document.getElementById('selectedGoalProgress').textContent = `Общий прогресс: ${avgProgress(goal)}%`;

  document.getElementById('activityList').innerHTML = goal.activities
    .map((item) => {
      const progress = Math.round((item.done / item.total) * 100);
      return `
      <div class="activity-row">
        <div class="activity-head">
          <span>${item.name}</span>
          <span>${item.done} действий</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${progress}%; background:${item.color}"></div></div>
      </div>`;
    })
    .join('');
}

function filteredTasks() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const sortBy = document.getElementById('sortSelect').value;

  let list = allTasks.filter((task) => task.goalId === selectedGoalId && task.status === selectedStatus);
  if (selectedSubgoal !== 'Все') {
    list = list.filter((task) => task.subgoal === selectedSubgoal);
  }
  if (query) {
    list = list.filter((task) => task.name.toLowerCase().includes(query) || task.subgoal.toLowerCase().includes(query));
  }

  if (sortBy === 'az') list.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  if (sortBy === 'progress') list.sort((a, b) => b.progress - a.progress);
  if (sortBy === 'new') list.sort((a, b) => b.createdOrder - a.createdOrder);

  return list;
}

function renderSubgoalFilters() {
  const goal = goals.find((g) => g.id === selectedGoalId);
  const filters = ['Все', ...goal.subgoals];
  const container = document.getElementById('subgoalFilters');
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
    <div class="tag-date">
      <span class="tag" style="background:${task.color}26; color:${task.color}">${task.subgoal}</span>
      <span>${task.date}</span>
    </div>
  </article>`;
}

function renderTasksArea() {
  renderSubgoalFilters();
  const tasks = filteredTasks();
  const total = allTasks.filter((task) => task.goalId === selectedGoalId).length;
  const done = allTasks.filter((task) => task.goalId === selectedGoalId && task.status === 'completed').length;

  document.getElementById('totalTasks').textContent = `Всего задач: ${total}`;
  document.getElementById('doneTasks').textContent = `Выполнено: ${done}`;
  document.getElementById('tasksList').innerHTML = tasks.length ? tasks.map(taskCard).join('') : '<p>Нет задач по выбранным фильтрам.</p>';

  document.querySelectorAll('.status-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.status === selectedStatus);
  });
}

function renderAll() {
  renderDropdown();
  renderRadars();
  renderAnalytics();
  renderTasksArea();
}

function bindUi() {
  const dropBtn = document.getElementById('goalDropdownBtn');
  const menu = document.getElementById('goalDropdown');

  dropBtn.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    dropBtn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.goal-dropdown-wrap')) {
      menu.hidden = true;
      dropBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.getElementById('searchInput').addEventListener('input', renderTasksArea);
  document.getElementById('sortSelect').addEventListener('change', renderTasksArea);

  document.querySelectorAll('.status-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedStatus = btn.dataset.status;
      renderTasksArea();
    });
  });
}

bindUi();
renderAll();
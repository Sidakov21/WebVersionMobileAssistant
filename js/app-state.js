const APP_STORAGE_KEY = 'mobile-assistant-state-v1';

function createDefaultState() {
  return {
    nextGoalId: 4,
    nextTaskId: 9,
    goals: [
      {
        id: 'goal-1',
        name: 'Цель 1',
        description: '',
        radar: [66, 66, 75, 50, 100],
        subgoals: [
          { name: 'Подцель 1', color: '#4fc35c' },
          { name: 'Подцель 2', color: '#4fc35c' },
          { name: 'Подцель 3', color: '#2e9df0' },
          { name: 'Подцель 4', color: '#ff4a3f' },
          { name: 'Подцель 5', color: '#ffab1f' }
        ],
        activities: [
          { name: 'Подцель 1', done: 2, total: 3, color: '#4fc35c' },
          { name: 'Подцель 2', done: 2, total: 3, color: '#4fc35c' },
          { name: 'Подцель 3', done: 3, total: 4, color: '#2e9df0' },
          { name: 'Подцель 4', done: 1, total: 2, color: '#ff4a3f' },
          { name: 'Подцель 5', done: 1, total: 1, color: '#ffab1f' }
        ]
      },
      {
        id: 'goal-2',
        name: 'Изучение Kotlin',
        description: 'План изучения языка и практики на Android.',
        radar: [82, 73, 67, 54, 39],
        subgoals: [
          { name: 'Синтаксис', color: '#4fc35c' },
          { name: 'ООП', color: '#2e9df0' },
          { name: 'Android', color: '#ffab1f' }
        ],
        activities: [
          { name: 'Синтаксис', done: 4, total: 5, color: '#4fc35c' },
          { name: 'ООП', done: 3, total: 4, color: '#2e9df0' },
          { name: 'Android', done: 2, total: 4, color: '#ffab1f' }
        ]
      },
      {
        id: 'goal-3',
        name: 'Физическое развитие',
        description: 'Режим тренировок, сна и питания.',
        radar: [40, 64, 52, 68, 70],
        subgoals: [
          { name: 'Кардио', color: '#ff4a3f' },
          { name: 'Сон', color: '#2e9df0' },
          { name: 'Питание', color: '#4fc35c' }
        ],
        activities: [
          { name: 'Кардио', done: 2, total: 5, color: '#ff4a3f' },
          { name: 'Сон', done: 4, total: 6, color: '#2e9df0' },
          { name: 'Питание', done: 5, total: 7, color: '#4fc35c' }
        ]
      }
    ],
    tasks: [
      { id: 1, goalId: 'goal-1', name: 'Задача 3.4', subgoal: 'Подцель 3', progress: 0, date: '17.02.2026', status: 'active', createdOrder: 8, color: '#2e9df0', note: '' },
      { id: 2, goalId: 'goal-1', name: 'Задача 3.2', subgoal: 'Подцель 3', progress: 0, date: '17.02.2026', status: 'active', createdOrder: 7, color: '#2e9df0', note: '' },
      { id: 3, goalId: 'goal-1', name: 'Задача 1.3', subgoal: 'Подцель 1', progress: 0, date: '17.02.2026', status: 'active', createdOrder: 6, color: '#4fc35c', note: '' },
      { id: 4, goalId: 'goal-1', name: 'Подцель 5.1', subgoal: 'Подцель 5', progress: 0, date: '17.02.2026', status: 'active', createdOrder: 5, color: '#ffab1f', note: 'новая заметка' },
      { id: 5, goalId: 'goal-1', name: 'Задача 2.2', subgoal: 'Подцель 2', progress: 100, date: '17.02.2026', status: 'completed', createdOrder: 4, color: '#4fc35c', note: '' },
      { id: 6, goalId: 'goal-1', name: 'Задача 2.1', subgoal: 'Подцель 2', progress: 100, date: '17.02.2026', status: 'completed', createdOrder: 3, color: '#4fc35c', note: '' },
      { id: 7, goalId: 'goal-2', name: 'Сделать mini-проект', subgoal: 'Android', progress: 70, date: '14.03.2026', status: 'active', createdOrder: 2, color: '#ffab1f', note: 'Подготовить экран и навигацию.' },
      { id: 8, goalId: 'goal-2', name: 'Пройти Kotlin Koans', subgoal: 'Синтаксис', progress: 100, date: '10.03.2026', status: 'completed', createdOrder: 1, color: '#4fc35c', note: '' }
    ]
  };
}

function loadAppState() {
  const raw = localStorage.getItem(APP_STORAGE_KEY);
  if (!raw) return createDefaultState();

  try {
    const parsed = JSON.parse(raw);
    if (!parsed.goals || !parsed.tasks) throw new Error('invalid state');
    return parsed;
  } catch {
    return createDefaultState();
  }
}

function saveAppState(state) {
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
}

function resetAppState() {
  const state = createDefaultState();
  saveAppState(state);
  return state;
}

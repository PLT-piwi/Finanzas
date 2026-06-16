/* ============================================
   data.js — modelo de datos y persistencia
   Toda la lógica de almacenamiento va aquí
   ============================================ */

const STORAGE_KEY = 'finanzas_data_v1';

// ---- Categorías ----
const CATEGORIES = {
  expense: [
    'Arriendo',
    'Alimentación',
    'Transporte',
    'Suscripciones',
    'Salud',
    'Ropa',
    'Entretenimiento',
    'Educación',
    'Ahorro',
    'Otro',
  ],
  income: [
    'Sueldo',
    'Bono',
    'Freelance',
    'Inversión',
    'Otro ingreso',
  ],
};

// Colores por categoría (hex, editable aquí)
const CATEGORY_COLORS = {
  Arriendo:       '#534AB7',
  Alimentación:   '#1D9E75',
  Transporte:     '#EF9F27',
  Suscripciones:  '#D85A30',
  Salud:          '#378ADD',
  Ropa:           '#D4537E',
  Entretenimiento:'#639922',
  Educación:      '#7F77DD',
  Ahorro:         '#0F6E56',
  Otro:           '#888780',
  Sueldo:         '#1D9E75',
  Bono:           '#534AB7',
  Freelance:      '#378ADD',
  Inversión:      '#EF9F27',
  'Otro ingreso': '#888780',
};

// ---- Estado en memoria ----
let state = {
  transactions: [],  // { id, type, description, category, amount, month, year, createdAt }
  goals: [],         // { id, name, target, current, color }
};

// ---- Persistencia ----
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state.transactions = parsed.transactions || [];
      state.goals = parsed.goals || [];
    }
  } catch (e) {
    console.warn('No se pudo cargar estado guardado:', e);
  }
}

// ---- CRUD Transacciones ----
function addTransaction(data) {
  const tx = {
    id: Date.now().toString(),
    type: data.type,           // 'income' | 'expense'
    description: data.description,
    category: data.category,
    amount: Number(data.amount),
    month: Number(data.month),
    year: Number(data.year),
    createdAt: new Date().toISOString(),
  };
  state.transactions.unshift(tx);
  saveState();
  return tx;
}

function updateTransaction(id, changes) {
  const idx = state.transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;
  state.transactions[idx] = { ...state.transactions[idx], ...changes, amount: Number(changes.amount) };
  saveState();
  return state.transactions[idx];
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveState();
}

function getTransactions({ month, year, type, category } = {}) {
  return state.transactions.filter(t => {
    if (month !== undefined && t.month !== month) return false;
    if (year  !== undefined && t.year  !== year)  return false;
    if (type  && type !== 'all'     && t.type     !== type)     return false;
    if (category && category !== 'all' && t.category !== category) return false;
    return true;
  });
}

// ---- CRUD Metas ----
function addGoal(data) {
  const goal = {
    id: Date.now().toString(),
    name: data.name,
    target: Number(data.target),
    current: Number(data.current) || 0,
    color: data.color || 'teal',
  };
  state.goals.push(goal);
  saveState();
  return goal;
}

function updateGoal(id, changes) {
  const idx = state.goals.findIndex(g => g.id === id);
  if (idx === -1) return null;
  state.goals[idx] = {
    ...state.goals[idx],
    ...changes,
    target:  Number(changes.target  ?? state.goals[idx].target),
    current: Number(changes.current ?? state.goals[idx].current),
  };
  saveState();
  return state.goals[idx];
}

function deleteGoal(id) {
  state.goals = state.goals.filter(g => g.id !== id);
  saveState();
}

function getGoals() { return state.goals; }

// ---- Años disponibles ----
function getAvailableYears() {
  const years = new Set(state.transactions.map(t => t.year));
  years.add(new Date().getFullYear());
  return [...years].sort();
}

// ---- Carga inicial ----
loadState();

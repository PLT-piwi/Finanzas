import { STORAGE_KEY } from '../constants';

const EMPTY = { transactions: [], goals: [] };

export function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };

    const parsed = JSON.parse(raw);
    return {
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveAppData({ transactions, goals }) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        transactions: transactions ?? [],
        goals: goals ?? [],
      }),
    );
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', e);
  }
}

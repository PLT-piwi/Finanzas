/* ============================================
   utils.js — funciones de utilidad
   ============================================ */

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

// ---- Formato de moneda CLP ----
function formatCLP(amount) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---- Formato corto (ej: $1.2M, $450k) ----
function formatShort(amount) {
  if (amount >= 1_000_000) return '$' + (amount / 1_000_000).toFixed(1) + 'M';
  if (amount >= 1_000)     return '$' + Math.round(amount / 1_000) + 'k';
  return '$' + amount;
}

// ---- Calcular totales de una lista de transacciones ----
function calcTotals(transactions) {
  let income = 0, expense = 0;
  for (const t of transactions) {
    if (t.type === 'income')  income  += t.amount;
    if (t.type === 'expense') expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

// ---- Agrupar gastos por categoría ----
function groupByCategory(transactions) {
  const map = {};
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    map[t.category] = (map[t.category] || 0) + t.amount;
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

// ---- Historial mensual (últimos N meses) ----
function getMonthlyHistory(n = 6) {
  const map = {};
  for (const t of state.transactions) {
    const key = `${t.year}-${String(t.month).padStart(2,'0')}`;
    if (!map[key]) map[key] = { month: t.month, year: t.year, income: 0, expense: 0 };
    if (t.type === 'income')  map[key].income  += t.amount;
    if (t.type === 'expense') map[key].expense += t.amount;
  }
  return Object.values(map)
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
    .slice(-n);
}

// ---- Toast helper ----
function showToast(msg, duration = 2500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), duration);
}

// ---- Exportar a Excel ----
function exportToExcel(month, year) {
  if (!window.XLSX) { alert('Librería XLSX no cargada'); return; }

  const wb = XLSX.utils.book_new();

  // Hoja 1 — todas las transacciones
  const all = state.transactions.map(t => ({
    'Fecha':       `${MONTHS[t.month]} ${t.year}`,
    'Tipo':        t.type === 'income' ? 'Ingreso' : 'Gasto',
    'Categoría':   t.category,
    'Descripción': t.description,
    'Monto (CLP)': t.amount,
  }));
  const ws1 = XLSX.utils.json_to_sheet(all);
  ws1['!cols'] = [{ wch: 16 },{ wch: 8 },{ wch: 16 },{ wch: 32 },{ wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Transacciones');

  // Hoja 2 — resumen mensual
  const history = getMonthlyHistory(12);
  const summary = history.map(r => ({
    'Mes':           MONTHS[r.month],
    'Año':           r.year,
    'Ingresos':      r.income,
    'Gastos':        r.expense,
    'Balance':       r.income - r.expense,
  }));
  const ws2 = XLSX.utils.json_to_sheet(summary);
  ws2['!cols'] = [{ wch: 12 },{ wch: 6 },{ wch: 14 },{ wch: 12 },{ wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Resumen Mensual');

  // Hoja 3 — gastos del mes seleccionado por categoría
  const monthly = getTransactions({ month, year, type: 'expense' });
  const { expense: totalExp } = calcTotals(getTransactions({ month, year }));
  const bycat = groupByCategory(monthly).map(([cat, amt]) => ({
    'Categoría':   cat,
    'Monto (CLP)': amt,
    '% del total': totalExp > 0 ? (amt / totalExp * 100).toFixed(1) + '%' : '0%',
  }));
  const ws3 = XLSX.utils.json_to_sheet(bycat);
  ws3['!cols'] = [{ wch: 18 },{ wch: 14 },{ wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws3, `Gastos ${MONTHS[month]}`);

  // Hoja 4 — metas
  const goalsData = getGoals().map(g => ({
    'Meta':          g.name,
    'Objetivo ($)':  g.target,
    'Ahorrado ($)':  g.current,
    'Restante ($)':  Math.max(0, g.target - g.current),
    'Progreso':      g.target > 0 ? (g.current / g.target * 100).toFixed(1) + '%' : '0%',
  }));
  const ws4 = XLSX.utils.json_to_sheet(goalsData);
  ws4['!cols'] = [{ wch: 28 },{ wch: 14 },{ wch: 14 },{ wch: 14 },{ wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'Metas');

  const filename = `mis_finanzas_${MONTHS[month]}_${year}.xlsx`;
  XLSX.writeFile(wb, filename);
  showToast(`✓ Exportado como ${filename}`);
}

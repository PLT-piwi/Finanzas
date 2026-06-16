/* ============================================
   app.js — controlador principal
   Conecta eventos del DOM con data.js y ui.js
   ============================================ */

// ---- Estado de la UI ----
const ui_state = {
  currentView:  'dashboard',
  filterMonth:  new Date().getMonth(),
  filterYear:   new Date().getFullYear(),
  addType:      'expense',
};

// ---- Navegación entre vistas ----
function navigateTo(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const viewEl = document.getElementById('view-' + viewId);
  const navEl  = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  if (viewEl) viewEl.classList.add('active');
  if (navEl)  navEl.classList.add('active');

  ui_state.currentView = viewId;
  refresh();
}

// ---- Refresh de la vista actual ----
function refresh() {
  const { filterMonth: month, filterYear: year } = ui_state;

  // Actualizar título del dashboard
  const dashTitle = document.getElementById('dashTitle');
  if (dashTitle) dashTitle.textContent = `${MONTHS[month]} ${year}`;

  if (ui_state.currentView === 'dashboard') refreshDashboard(month, year);
  if (ui_state.currentView === 'transactions') refreshTransactions();
  if (ui_state.currentView === 'goals') renderGoals();
}

function refreshDashboard(month, year) {
  const txs = getTransactions({ month, year });
  const totals = calcTotals(txs);
  renderMetrics(totals);

  // Categorías
  const bycat = groupByCategory(txs);
  renderCategoryBars(document.getElementById('categoryBars'), bycat, totals.expense);

  // Gráfico mensual
  const history = getMonthlyHistory(6);
  drawMonthlyChart(history);

  // Últimas 5 transacciones
  const recentContainer = document.getElementById('recentList');
  const recent = txs.slice(0, 5);
  if (!recent.length) {
    recentContainer.innerHTML = '<p class="empty-state">No hay transacciones este mes. <button class="link-btn" onclick="navigateTo(\'add\')">Agregar una →</button></p>';
  } else {
    renderTxList('recentList', recent, {
      onDelete: id => { deleteTransaction(id); refresh(); showToast('Transacción eliminada'); },
      onEdit: tx => openEditModal(tx),
    });
  }
}

function refreshTransactions() {
  const type     = document.getElementById('txFilterType')?.value || 'all';
  const category = document.getElementById('txFilterCat')?.value  || 'all';
  const { filterMonth: month, filterYear: year } = ui_state;
  const txs = getTransactions({ month, year, type, category });

  renderTxList('fullList', txs, {
    onDelete: id => { deleteTransaction(id); refreshTransactions(); showToast('Transacción eliminada'); },
    onEdit: tx => openEditModal(tx),
  });
}

// ---- Modal de edición ----
function openEditModal(tx) {
  const desc   = prompt('Descripción:', tx.description);
  if (desc === null) return;
  const amount = prompt('Monto:', tx.amount);
  if (amount === null || isNaN(Number(amount))) return;
  updateTransaction(tx.id, { ...tx, description: desc, amount });
  refresh();
  showToast('✓ Transacción actualizada');
}

// ---- Agregar transacción ----
function handleAdd() {
  const desc   = document.getElementById('fDesc').value.trim();
  const amount = document.getElementById('fAmount').value;
  const cat    = document.getElementById('fCat').value;
  const month  = document.getElementById('fMonth').value;
  const year   = document.getElementById('fYear').value;
  const fb     = document.getElementById('formFeedback');

  if (!desc)            { fb.textContent = 'Escribe una descripción.'; return; }
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
                        { fb.textContent = 'Ingresa un monto válido.'; return; }

  fb.textContent = '';
  addTransaction({ type: ui_state.addType, description: desc, category: cat, amount, month, year });

  // Limpiar campos
  document.getElementById('fDesc').value   = '';
  document.getElementById('fAmount').value = '';

  // Actualizar año selector por si hay nuevo
  populateYearSelect(document.getElementById('filterYear'));

  showToast('✓ Transacción agregada');
  navigateTo('dashboard');
}

// ---- Wiring inicial ----
document.addEventListener('DOMContentLoaded', () => {

  // Poblar selects fijos
  populateYearSelect(document.getElementById('filterYear'));
  populateCatSelect(document.getElementById('fCat'), 'expense');

  // Sincronizar filtros con estado
  const filterMonth = document.getElementById('filterMonth');
  const filterYear  = document.getElementById('filterYear');
  filterMonth.value = ui_state.filterMonth;
  filterYear.value  = ui_state.filterYear;

  // Filtros de período
  filterMonth.addEventListener('change', () => {
    ui_state.filterMonth = Number(filterMonth.value);
    refresh();
  });
  filterYear.addEventListener('change', () => {
    ui_state.filterYear = Number(filterYear.value);
    refresh();
  });

  // Navegación sidebar
  document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.view));
  });

  // Link-btn en empty state
  document.addEventListener('click', e => {
    if (e.target.classList.contains('link-btn') && e.target.dataset.view) {
      navigateTo(e.target.dataset.view);
    }
  });

  // Toggle ingreso/gasto
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ui_state.addType = btn.dataset.type;
      populateCatSelect(document.getElementById('fCat'), ui_state.addType);
    });
  });

  // Botón agregar
  document.getElementById('btnAdd')?.addEventListener('click', handleAdd);

  // Exportar
  document.getElementById('btnExport')?.addEventListener('click', () => {
    exportToExcel(ui_state.filterMonth, ui_state.filterYear);
  });

  // Filtros de transacciones
  document.getElementById('txFilterType')?.addEventListener('change', refreshTransactions);

  // Filtro por categoría — poblar opciones
  const txCatSelect = document.getElementById('txFilterCat');
  if (txCatSelect) {
    const allCats = [...CATEGORIES.expense, ...CATEGORIES.income];
    txCatSelect.innerHTML = '<option value="all">Todas las categorías</option>' +
      allCats.map(c => `<option value="${c}">${c}</option>`).join('');
    txCatSelect.addEventListener('change', refreshTransactions);
  }

  // Goals — abrir modal
  document.getElementById('btnAddGoal')?.addEventListener('click', () => {
    document.getElementById('goalModal').classList.remove('hidden');
  });
  document.getElementById('btnCancelGoal')?.addEventListener('click', () => {
    document.getElementById('goalModal').classList.add('hidden');
  });
  document.getElementById('btnSaveGoal')?.addEventListener('click', () => {
    const name    = document.getElementById('gName').value.trim();
    const target  = document.getElementById('gTarget').value;
    const current = document.getElementById('gCurrent').value;
    const color   = document.getElementById('gColor').value;
    if (!name || !target || isNaN(Number(target))) { alert('Completa nombre y meta.'); return; }
    addGoal({ name, target, current, color });
    document.getElementById('goalModal').classList.add('hidden');
    document.getElementById('gName').value    = '';
    document.getElementById('gTarget').value  = '';
    document.getElementById('gCurrent').value = '';
    renderGoals();
    showToast('✓ Meta creada');
  });

  // Redimensionar gráfico al cambiar ventana
  window.addEventListener('resize', () => {
    if (ui_state.currentView === 'dashboard') drawMonthlyChart(getMonthlyHistory(6));
  });

  // Vista inicial
  navigateTo('dashboard');
});

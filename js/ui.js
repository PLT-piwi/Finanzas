/* ============================================
   ui.js — funciones de renderizado del DOM
   Separa la lógica de presentación del resto
   ============================================ */

// ---- Ítem de transacción ----
function renderTxItem(tx, { onDelete, onEdit } = {}) {
  const el = document.createElement('div');
  el.className = 'tx-item';
  el.dataset.id = tx.id;

  const color = CATEGORY_COLORS[tx.category] || '#888780';
  const sign  = tx.type === 'income' ? '+' : '-';
  const cls   = tx.type === 'income' ? 'income' : 'expense';

  el.innerHTML = `
    <div class="tx-item__dot" style="background:${color}"></div>
    <div class="tx-item__info">
      <p class="tx-item__desc">${escHtml(tx.description)}</p>
      <p class="tx-item__meta">${tx.category} · ${MONTHS[tx.month]} ${tx.year}</p>
    </div>
    <span class="tx-item__amount tx-item__amount--${cls}">${sign}${formatCLP(tx.amount)}</span>
    <div class="tx-item__actions">
      <button class="tx-item__btn btn-edit" title="Editar" aria-label="Editar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="tx-item__btn tx-item__btn--delete btn-delete" title="Eliminar" aria-label="Eliminar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
      </button>
    </div>
  `;

  el.querySelector('.btn-delete').addEventListener('click', () => onDelete && onDelete(tx.id));
  el.querySelector('.btn-edit').addEventListener('click', () => onEdit && onEdit(tx));

  return el;
}

// ---- Renderizar lista de transacciones ----
function renderTxList(containerId, txList, handlers) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!txList.length) {
    container.innerHTML = '<p class="empty-state">Sin transacciones en este período.</p>';
    return;
  }

  container.innerHTML = '';
  txList.forEach(tx => container.appendChild(renderTxItem(tx, handlers)));
}

// ---- Render métricas del dashboard ----
function renderMetrics({ income, expense, balance }) {
  document.getElementById('metricIncome').textContent  = formatCLP(income);
  document.getElementById('metricExpense').textContent = formatCLP(expense);
  document.getElementById('metricBalance').textContent = formatCLP(balance);

  const savingsRate = income > 0 ? Math.round(balance / income * 100) : 0;
  document.getElementById('metricSavings').textContent = Math.max(0, savingsRate) + '%';

  const inCount  = state.transactions.filter(t => t.type === 'income').length;
  const exCount  = state.transactions.filter(t => t.type === 'expense').length;
  document.getElementById('metricIncomeSub').textContent  = inCount  + ' entrada' + (inCount !== 1 ? 's' : '');
  document.getElementById('metricExpenseSub').textContent = exCount  + ' salida'  + (exCount !== 1 ? 's' : '');

  // Color del balance
  const balEl = document.getElementById('metricBalance');
  balEl.style.color = balance >= 0 ? 'var(--blue-600)' : 'var(--red-600)';
}

// ---- Render goals ----
function renderGoals() {
  const container = document.getElementById('goalsGrid');
  if (!container) return;
  const goals = getGoals();

  if (!goals.length) {
    container.innerHTML = '<p class="empty-state" style="grid-column:1/-1">Aún no tienes metas. Agrega una para comenzar.</p>';
    return;
  }

  container.innerHTML = goals.map(g => {
    const pct     = g.target > 0 ? Math.min(100, Math.round(g.current / g.target * 100)) : 0;
    const done    = pct >= 100;
    return `
      <div class="goal-card" data-id="${g.id}">
        <div class="goal-card__header">
          <p class="goal-card__name">${escHtml(g.name)}</p>
          <span class="goal-card__pct goal-pct-${g.color}">${pct}%</span>
        </div>
        <div class="goal-card__track">
          <div class="goal-card__fill goal-color-${g.color}" style="width:${pct}%"></div>
        </div>
        <div class="goal-card__amounts">
          <span>${formatCLP(g.current)} ahorrado</span>
          <span>Meta: ${formatCLP(g.target)}</span>
        </div>
        <div class="goal-card__actions">
          <button class="btn btn--secondary btn-deposit" style="flex:1;justify-content:center;font-size:var(--text-xs);">+ Depositar</button>
          <button class="btn btn--ghost btn-edit-goal" style="font-size:var(--text-xs);">Editar</button>
          <button class="btn btn--ghost btn--danger btn-del-goal" style="font-size:var(--text-xs);">Borrar</button>
        </div>
      </div>
    `;
  }).join('');

  // Eventos de goals
  container.querySelectorAll('.btn-deposit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.goal-card').dataset.id;
      const amtStr = prompt('¿Cuánto depositar?');
      const amt = parseFloat(amtStr);
      if (!isNaN(amt) && amt > 0) {
        const g = getGoals().find(x => x.id === id);
        if (g) { updateGoal(id, { current: g.current + amt }); renderGoals(); showToast('✓ Depósito registrado'); }
      }
    });
  });

  container.querySelectorAll('.btn-del-goal').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.goal-card').dataset.id;
      if (confirm('¿Eliminar esta meta?')) { deleteGoal(id); renderGoals(); showToast('Meta eliminada'); }
    });
  });
}

// ---- Escape HTML ----
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ---- Poblar selects de categoría ----
function populateCatSelect(selectEl, type) {
  const cats = CATEGORIES[type] || CATEGORIES.expense;
  selectEl.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

// ---- Poblar select de años ----
function populateYearSelect(selectEl) {
  const years = getAvailableYears();
  selectEl.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
  selectEl.value = new Date().getFullYear();
}

/* ============================================
   charts.js — dibujo de gráficos con Canvas
   Sin dependencias externas
   ============================================ */

// ---- Gráfico de barras mensuales ----
function drawMonthlyChart(history) {
  const canvas = document.getElementById('monthlyCanvas');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.parentElement.clientWidth || 400;
  const H = 160;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  if (!history.length) {
    ctx.fillStyle = '#B4B2A9';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sin datos aún', W / 2, H / 2);
    return;
  }

  const maxVal = Math.max(...history.map(r => Math.max(r.income, r.expense)), 1);
  const padL = 8, padR = 8, padT = 8, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const barGroup = chartW / history.length;
  const barW     = Math.min(barGroup * 0.35, 22);
  const gap      = 4;

  history.forEach((row, i) => {
    const x = padL + i * barGroup + (barGroup - barW * 2 - gap) / 2;

    // Barra ingreso
    const hInc = (row.income  / maxVal) * chartH;
    ctx.fillStyle = '#1D9E75';
    ctx.beginPath();
    ctx.roundRect(x, padT + chartH - hInc, barW, hInc, [3, 3, 0, 0]);
    ctx.fill();

    // Barra gasto
    const hExp = (row.expense / maxVal) * chartH;
    ctx.fillStyle = '#D85A30';
    ctx.beginPath();
    ctx.roundRect(x + barW + gap, padT + chartH - hExp, barW, hExp, [3, 3, 0, 0]);
    ctx.fill();

    // Etiqueta mes
    ctx.fillStyle = '#B4B2A9';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      MONTHS[row.month].slice(0, 3),
      x + barW + gap / 2,
      H - padB + 14
    );
  });

  // Línea base
  ctx.strokeStyle = '#E4E2D9';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT + chartH);
  ctx.lineTo(W - padR, padT + chartH);
  ctx.stroke();
}

// ---- Barras de categoría ----
function renderCategoryBars(container, byCategory, total) {
  if (!byCategory.length) {
    container.innerHTML = '<p class="empty-state">Sin gastos este mes</p>';
    return;
  }

  container.innerHTML = byCategory.map(([cat, amt]) => {
    const pct = total > 0 ? Math.round(amt / total * 100) : 0;
    const color = CATEGORY_COLORS[cat] || '#888780';
    return `
      <div class="cat-row">
        <span class="cat-row__label">${cat}</span>
        <div class="cat-row__track">
          <div class="cat-row__fill" style="width:${pct}%; background:${color};">
            ${pct > 12 ? `<span class="cat-row__fill-label">${pct}%</span>` : ''}
          </div>
        </div>
        <span class="cat-row__amount">${formatShort(amt)}</span>
      </div>
    `;
  }).join('');
}

import { MONTHS } from './constants';

export const formatCLP = (amount) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount || 0);

export const formatShort = (amount) => {
  if (amount >= 1_000_000) return '$' + (amount / 1_000_000).toFixed(1) + 'M';
  if (amount >= 1_000) return '$' + Math.round(amount / 1_000) + 'k';
  return '$' + amount;
};

export const calcTotals = (txs) => {
  let income = 0;
  let expense = 0;
  for (const t of txs) {
    if (t.type === 'income') income += t.amount;
    if (t.type === 'expense') expense += t.amount;
  }
  return { income, expense, balance: income - expense };
};

export const groupByCategory = (txs) => {
  const map = {};
  for (const t of txs) {
    if (t.type !== 'expense') continue;
    map[t.category] = (map[t.category] || 0) + t.amount;
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
};

export const getMonthlyHistory = (txs, n = 6) => {
  const map = {};
  for (const t of txs) {
    const key = `${t.year}-${String(t.month).padStart(2, '0')}`;
    if (!map[key]) map[key] = { month: t.month, year: t.year, income: 0, expense: 0 };
    if (t.type === 'income') map[key].income += t.amount;
    if (t.type === 'expense') map[key].expense += t.amount;
  }
  return Object.values(map)
    .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))
    .slice(-n);
};

export const drawMonthlyChart = (canvas, history) => {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.parentElement?.clientWidth || 400;
  const H = 160;

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  if (!history.length) {
    ctx.fillStyle = '#B4B2A9';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sin datos aún', W / 2, H / 2);
    return;
  }

  const maxVal = Math.max(...history.map((r) => Math.max(r.income, r.expense)), 1);
  const padL = 8;
  const padR = 8;
  const padT = 8;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barGroup = chartW / history.length;
  const barW = Math.min(barGroup * 0.35, 22);
  const gap = 4;

  history.forEach((row, i) => {
    const x = padL + i * barGroup + (barGroup - barW * 2 - gap) / 2;

    const hInc = (row.income / maxVal) * chartH;
    ctx.fillStyle = '#1D9E75';
    ctx.beginPath();
    ctx.roundRect(x, padT + chartH - hInc, barW, hInc, [3, 3, 0, 0]);
    ctx.fill();

    const hExp = (row.expense / maxVal) * chartH;
    ctx.fillStyle = '#D85A30';
    ctx.beginPath();
    ctx.roundRect(x + barW + gap, padT + chartH - hExp, barW, hExp, [3, 3, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#B4B2A9';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(MONTHS[row.month].slice(0, 3), x + barW + gap / 2, H - padB + 14);
  });

  ctx.strokeStyle = '#E4E2D9';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT + chartH);
  ctx.lineTo(W - padR, padT + chartH);
  ctx.stroke();
};


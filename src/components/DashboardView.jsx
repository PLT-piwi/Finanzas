import { useEffect } from 'react';
import { CATEGORY_COLORS } from '../constants';
import { drawMonthlyChart, formatCLP, formatShort, groupByCategory } from '../utils';
import TxItem from './TxItem';

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <p className="metric-card__label">{label}</p>
      <p className="metric-card__value">{value}</p>
    </div>
  );
}

export default function DashboardView({ title, totals, monthTxs, monthlyHistory, canvasRef, onDeleteTx, onEditTx }) {
  const byCategory = groupByCategory(monthTxs);

  useEffect(() => {
    drawMonthlyChart(canvasRef.current, monthlyHistory);
  }, [canvasRef, monthlyHistory]);

  return (
    <section className="view active">
      <header className="view__header">
        <div>
          <p className="view__eyebrow">Panel principal</p>
          <h1 className="view__title">{title}</h1>
        </div>
      </header>
      <div className="metrics-grid">
        <MetricCard label="Ingresos" value={formatCLP(totals.income)} />
        <MetricCard label="Gastos" value={formatCLP(totals.expense)} />
        <MetricCard label="Balance" value={formatCLP(totals.balance)} />
        <MetricCard label="Tasa de ahorro" value={`${totals.income > 0 ? Math.max(0, Math.round((totals.balance / totals.income) * 100)) : 0}%`} />
      </div>
      <div className="charts-row">
        <div className="card card--chart">
          <p className="card__title">Gastos por categoría</p>
          <div className="category-bars">
            {byCategory.length === 0 && <p className="empty-state">Sin gastos este mes</p>}
            {byCategory.map(([cat, amt]) => {
              const pct = totals.expense > 0 ? Math.round((amt / totals.expense) * 100) : 0;
              const color = CATEGORY_COLORS[cat] || '#888780';
              return (
                <div className="cat-row" key={cat}>
                  <span className="cat-row__label">{cat}</span>
                  <div className="cat-row__track">
                    <div className="cat-row__fill" style={{ width: `${pct}%`, background: color }}>
                      {pct > 12 && <span className="cat-row__fill-label">{pct}%</span>}
                    </div>
                  </div>
                  <span className="cat-row__amount">{formatShort(amt)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card card--chart">
          <p className="card__title">Evolución mensual</p>
          <div className="monthly-chart">
            <canvas ref={canvasRef} />
            <div className="chart-legend">
              <span className="legend-dot legend-dot--income" /> Ingresos
              <span className="legend-dot legend-dot--expense" /> Gastos
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <p className="card__title">Últimas transacciones</p>
        <div className="tx-list">
          {monthTxs.slice(0, 5).map((tx) => (
            <TxItem key={tx.id} tx={tx} onDelete={() => onDeleteTx(tx.id)} onEdit={() => onEditTx(tx)}/>
          ))}
          {!monthTxs.length && <p className="empty-state">No hay transacciones este mes.</p>}
        </div>
      </div>
    </section>
  );
}


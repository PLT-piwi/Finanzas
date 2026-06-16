import { MONTHS } from '../constants';

export default function Sidebar({ view, setView, filterMonth, setFilterMonth, filterYear, setFilterYear, years, onExport }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__icon">₱</span>
        <span className="sidebar__name">Mis Finanzas</span>
      </div>
      <nav className="sidebar__nav">
        {[
          ['dashboard', 'Resumen'],
          ['transactions', 'Transacciones'],
          ['add', 'Agregar'],
          ['goals', 'Metas'],
        ].map(([id, label]) => (
          <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => setView(id)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="sidebar__footer">
        <div className="period-selector">
          <select className="select-pill" value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))}>
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>
          <select className="select-pill" value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn--export" onClick={onExport}>
          Exportar Excel
        </button>
      </div>
    </aside>
  );
}


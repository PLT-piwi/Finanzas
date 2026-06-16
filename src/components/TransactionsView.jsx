import { CATEGORIES } from '../constants';
import TxItem from './TxItem';

export default function TransactionsView({ txFilterType, setTxFilterType, txFilterCat, setTxFilterCat, fullFiltered, onDeleteTx }) {
  return (
    <section className="view active">
      <header className="view__header">
        <h1 className="view__title">Transacciones</h1>
        <div className="header-actions">
          <select className="select-pill" value={txFilterType} onChange={(e) => setTxFilterType(e.target.value)}>
            <option value="all">Todos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
          <select className="select-pill" value={txFilterCat} onChange={(e) => setTxFilterCat(e.target.value)}>
            <option value="all">Todas las categorías</option>
            {[...CATEGORIES.expense, ...CATEGORIES.income].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </header>
      <div className="card">
        <div className="tx-list">
          {fullFiltered.map((tx) => (
            <TxItem key={tx.id} tx={tx} onDelete={() => onDeleteTx(tx.id)} />
          ))}
          {!fullFiltered.length && <p className="empty-state">Sin transacciones en este período.</p>}
        </div>
      </div>
    </section>
  );
}


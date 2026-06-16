import { MONTHS } from '../constants';
import { formatCLP } from '../utils';

export default function TxItem({ tx, onDelete }) {
  return (
    <div className="tx-item">
      <div className="tx-item__info">
        <p className="tx-item__desc">{tx.description}</p>
        <p className="tx-item__meta">
          {tx.category} · {MONTHS[tx.month]} {tx.year}
        </p>
      </div>
      <span className={`tx-item__amount tx-item__amount--${tx.type === 'income' ? 'income' : 'expense'}`}>
        {tx.type === 'income' ? '+' : '-'}
        {formatCLP(tx.amount)}
      </span>
      <button className="tx-item__btn tx-item__btn--delete" onClick={onDelete}>
        Eliminar
      </button>
    </div>
  );
}


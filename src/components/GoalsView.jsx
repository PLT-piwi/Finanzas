import { useMemo, useState } from 'react';
import { formatCLP } from '../utils';

export default function GoalsView({ goals, onAddGoal, onDepositGoal, onDeleteGoal }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState('');

  const [addForm, setAddForm] = useState({
    name: '',
    target: '',
    current: '',
    color: 'teal',
  });
  const [addErrors, setAddErrors] = useState({});
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');

  const selectedGoal = useMemo(
    () => goals.find((g) => g.id === selectedGoalId) || null,
    [goals, selectedGoalId],
  );

  const openAddModal = () => {
    setAddErrors({});
    setIsAddOpen(true);
  };

  const closeAddModal = () => {
    setIsAddOpen(false);
    setAddForm({ name: '', target: '', current: '', color: 'teal' });
    setAddErrors({});
  };

  const openDepositModal = (id) => {
    setSelectedGoalId(id);
    setDepositAmount('');
    setDepositError('');
    setIsDepositOpen(true);
  };

  const closeDepositModal = () => {
    setIsDepositOpen(false);
    setSelectedGoalId('');
    setDepositAmount('');
    setDepositError('');
  };

  const openDeleteModal = (id) => {
    setSelectedGoalId(id);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setSelectedGoalId('');
  };

  const submitAddGoal = () => {
    const nextErrors = {};

    if (!addForm.name.trim()) {
      nextErrors.name = 'Escribe un nombre para la meta.';
    }

    const target = Number(addForm.target);
    if (!addForm.target || isNaN(target) || target <= 0) {
      nextErrors.target = 'Ingresa una meta válida mayor a 0.';
    }

    if (addForm.current !== '' && (isNaN(Number(addForm.current)) || Number(addForm.current) < 0)) {
      nextErrors.current = 'El monto ahorrado no puede ser negativo.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setAddErrors(nextErrors);
      return;
    }

    onAddGoal({
      name: addForm.name,
      target,
      current: Number(addForm.current) || 0,
      color: addForm.color,
    });
    closeAddModal();
  };

  const submitDeposit = () => {
    if (!selectedGoal) return;

    const amt = Number(depositAmount);
    if (!depositAmount || isNaN(amt) || amt <= 0) {
      setDepositError('Ingresa un monto válido mayor a 0.');
      return;
    }

    const ok = onDepositGoal(selectedGoal.id, depositAmount);
    if (ok) closeDepositModal();
  };

  const confirmDelete = () => {
    if (!selectedGoal) return;
    onDeleteGoal(selectedGoal.id);
    closeDeleteModal();
  };

  return (
    <section className="view active">
      <header className="view__header">
        <h1 className="view__title">Mis metas</h1>
        <button className="btn btn--secondary" onClick={openAddModal}>
          + Nueva meta
        </button>
      </header>
      <div className="goals-grid">
        {goals.map((g) => {
          const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
          return (
            <div key={g.id} className="goal-card">
              <div className="goal-card__header">
                <p className="goal-card__name">{g.name}</p>
                <span className="goal-card__pct">{pct}%</span>
              </div>
              <div className="goal-card__amounts">
                <span>{formatCLP(g.current)} ahorrado</span>
                <span>Meta: {formatCLP(g.target)}</span>
              </div>
              <div className="goal-card__actions">
                <button className="btn btn--secondary" onClick={() => openDepositModal(g.id)}>
                  + Depositar
                </button>
                <button className="btn btn--ghost btn--danger" onClick={() => openDeleteModal(g.id)}>
                  Borrar
                </button>
              </div>
            </div>
          );
        })}
        {!goals.length && <p className="empty-state">Aún no tienes metas.</p>}
      </div>

      {isAddOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <p className="modal__title">Nueva meta de ahorro</p>
            <div className="field">
              <label className="field__label">Nombre</label>
              <input
                className="field__input"
                type="text"
                value={addForm.name}
                onChange={(e) => {
                  setAddErrors((prev) => {
                    const next = { ...prev };
                    delete next.name;
                    return next;
                  });
                  setAddForm({ ...addForm, name: e.target.value });
                }}
                placeholder="ej. Fondo de emergencia"
              />
              {addErrors.name && <p className="field__error">{addErrors.name}</p>}
            </div>
            <div className="field">
              <label className="field__label">Meta ($)</label>
              <input
                className="field__input field__input--mono"
                type="number"
                value={addForm.target}
                onChange={(e) => {
                  setAddErrors((prev) => {
                    const next = { ...prev };
                    delete next.target;
                    return next;
                  });
                  setAddForm({ ...addForm, target: e.target.value });
                }}
                placeholder="0"
                min="0"
              />
              {addErrors.target && <p className="field__error">{addErrors.target}</p>}
            </div>
            <div className="field">
              <label className="field__label">Ya ahorrado ($)</label>
              <input
                className="field__input field__input--mono"
                type="number"
                value={addForm.current}
                onChange={(e) => {
                  setAddErrors((prev) => {
                    const next = { ...prev };
                    delete next.current;
                    return next;
                  });
                  setAddForm({ ...addForm, current: e.target.value });
                }}
                placeholder="0"
                min="0"
              />
              {addErrors.current && <p className="field__error">{addErrors.current}</p>}
            </div>
            <div className="field">
              <label className="field__label">Color</label>
              <select
                className="field__input"
                value={addForm.color}
                onChange={(e) => setAddForm({ ...addForm, color: e.target.value })}
              >
                <option value="teal">Verde</option>
                <option value="blue">Azul</option>
                <option value="amber">Amarillo</option>
                <option value="coral">Coral</option>
                <option value="purple">Morado</option>
              </select>
            </div>
            <div className="modal__actions">
              <button className="btn btn--primary" onClick={submitAddGoal}>
                Guardar
              </button>
              <button className="btn btn--ghost" onClick={closeAddModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isDepositOpen && selectedGoal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <p className="modal__title">Depositar en "{selectedGoal.name}"</p>
            <div className="field">
              <label className="field__label">Monto a depositar ($)</label>
              <input
                className="field__input field__input--mono"
                type="number"
                value={depositAmount}
                onChange={(e) => {
                  setDepositError('');
                  setDepositAmount(e.target.value);
                }}
                placeholder="0"
                min="0"
              />
              {depositError && <p className="field__error">{depositError}</p>}
            </div>
            <div className="modal__actions">
              <button className="btn btn--primary" onClick={submitDeposit}>
                Confirmar
              </button>
              <button className="btn btn--ghost" onClick={closeDepositModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && selectedGoal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <p className="modal__title">Eliminar meta</p>
            <p className="empty-state" style={{ padding: 0, textAlign: 'left' }}>
              ¿Seguro que quieres eliminar <strong>{selectedGoal.name}</strong>?
            </p>
            <div className="modal__actions">
              <button className="btn btn--danger btn--secondary" onClick={confirmDelete}>
                Eliminar
              </button>
              <button className="btn btn--ghost" onClick={closeDeleteModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

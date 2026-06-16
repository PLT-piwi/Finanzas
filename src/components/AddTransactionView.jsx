import { useState } from 'react';
import { CATEGORIES, MONTHS } from '../constants';

export default function AddTransactionView({ addType, setAddType, form, setForm, onAddTransaction, isEditing }) {
  const [errors, setErrors] = useState({});

  const clearError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = () => {
    const nextErrors = {};
    if (!form.description.trim()) nextErrors.description = 'Escribe una descripción.';
    const amount = Number(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) nextErrors.amount = 'Ingresa un monto válido mayor a 0.';
    if (Object.keys(nextErrors).length > 0) { setErrors(nextErrors); return; }
    setErrors({});
    onAddTransaction();
  };

  return (
    <section className="view active">
      <header className="view__header">
        <h1 className="view__title">{isEditing ? 'Editar transacción' : 'Agregar transacción'}</h1>
      </header>
      <div className="card form-card">
        <div className="type-toggle">
          <button className={`type-btn ${addType === 'expense' ? 'active' : ''}`} onClick={() => setAddType('expense')}>Gasto</button>
          <button className={`type-btn ${addType === 'income' ? 'active' : ''}`} onClick={() => setAddType('income')}>Ingreso</button>
        </div>
        <div className="form-grid">
          <div className="field field--full">
            <label className="field__label">Descripción</label>
            <input
              className="field__input"
              value={form.description}
              onChange={(e) => { clearError('description'); setForm({ ...form, description: e.target.value }); }}
              placeholder="ej. Supermercado Líder"
            />
            {errors.description && <p className="field__error">{errors.description}</p>}
          </div>
          <div className="field">
            <label className="field__label">Monto (CLP)</label>
            <input
              className="field__input field__input--mono"
              type="number"
              value={form.amount}
              onChange={(e) => { clearError('amount'); setForm({ ...form, amount: e.target.value }); }}
              placeholder="0"
              min="0"
            />
            {errors.amount && <p className="field__error">{errors.amount}</p>}
          </div>
          <div className="field">
            <label className="field__label">Categoría</label>
            <select className="field__input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {(addType === 'expense' ? CATEGORIES.expense : CATEGORIES.income).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label">Mes</label>
            <select className="field__input" value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}>
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field__label">Año</label>
            <input className="field__input" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
          </div>
        </div>
        <button className="btn btn--primary btn--full" onClick={handleSubmit}>
          {isEditing ? 'Guardar cambios' : 'Agregar transacción'}
        </button>
      </div>
    </section>
  );
}
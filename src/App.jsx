import { useEffect, useMemo, useRef, useState } from 'react';
import AddTransactionView from './components/AddTransactionView';
import DashboardView from './components/DashboardView';
import GoalsView from './components/GoalsView';
import Sidebar from './components/Sidebar';
import TransactionsView from './components/TransactionsView';
import { CATEGORIES, MONTHS } from './constants';
import { getMonthlyHistory, groupByCategory } from './utils';
import { loadAppData, saveAppData } from './utils/storage';

export default function App() {
  const now = new Date();
  const [view, setView] = useState('dashboard');
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [addType, setAddType] = useState('expense');
  const [transactions, setTransactions] = useState(() => loadAppData().transactions);
  const [goals, setGoals] = useState(() => loadAppData().goals);
  const [txFilterType, setTxFilterType] = useState('all');
  const [txFilterCat, setTxFilterCat] = useState('all');
  const [form, setForm] = useState({ description: '', amount: '', category: CATEGORIES.expense[0], month: now.getMonth(), year: now.getFullYear() });
  const [toast, setToast] = useState('');
  const canvasRef = useRef(null);
  const skipSaveRef = useRef(true);

  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    saveAppData({ transactions, goals });
  }, [transactions, goals]);

  const showToast = (msg) => {
    setToast(msg);
    if (!msg) return;
    setTimeout(() => setToast(''), 2500);
  };

  const years = useMemo(() => [...new Set([now.getFullYear(), ...transactions.map((t) => t.year)])].sort((a, b) => a - b), [transactions, now]);
  const monthTxs = useMemo(() => transactions.filter((t) => t.month === Number(filterMonth) && t.year === Number(filterYear)), [transactions, filterMonth, filterYear]);
  const totals = useMemo(() => {
    const income = monthTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [monthTxs]);

  const fullFiltered = useMemo(
    () =>
      monthTxs.filter((t) => (txFilterType === 'all' ? true : t.type === txFilterType) && (txFilterCat === 'all' ? true : t.category === txFilterCat)),
    [monthTxs, txFilterType, txFilterCat],
  );

  const monthlyHistory = useMemo(() => getMonthlyHistory(transactions, 6), [transactions]);

  const addTransaction = () => {
    if (!form.description.trim() || Number(form.amount) <= 0) return;
    const tx = {
      id: Date.now().toString(),
      type: addType,
      description: form.description.trim(),
      category: form.category,
      amount: Number(form.amount),
      month: Number(form.month),
      year: Number(form.year),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);
    setForm((prev) => ({ ...prev, description: '', amount: '' }));
    setView('dashboard');
    showToast('✓ Transacción agregada');
  };

  const deleteTx = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transacción eliminada');
  };

  const handleExport = () => {
    const XLSX = window.XLSX;
    if (!XLSX) {
      alert('Librería XLSX no cargada');
      return;
    }

    const wb = XLSX.utils.book_new();

    const all = transactions.map((t) => ({
      Fecha: `${MONTHS[t.month]} ${t.year}`,
      Tipo: t.type === 'income' ? 'Ingreso' : 'Gasto',
      'Categoría': t.category,
      'Descripción': t.description,
      'Monto (CLP)': t.amount,
    }));
    const ws1 = XLSX.utils.json_to_sheet(all);
    XLSX.utils.book_append_sheet(wb, ws1, 'Transacciones');

    const history = getMonthlyHistory(transactions, 12);
    const summary = history.map((r) => ({
      Mes: MONTHS[r.month],
      Año: r.year,
      Ingresos: r.income,
      Gastos: r.expense,
      Balance: r.income - r.expense,
    }));
    const ws2 = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen Mensual');

    const monthly = monthTxs.filter((t) => t.type === 'expense');
    const { expense: totalExp } = totals;
    const bycat = groupByCategory(monthly).map(([cat, amt]) => ({
      'Categoría': cat,
      'Monto (CLP)': amt,
      '% del total': totalExp > 0 ? ((amt / totalExp) * 100).toFixed(1) + '%' : '0%',
    }));
    const ws3 = XLSX.utils.json_to_sheet(bycat);
    XLSX.utils.book_append_sheet(wb, ws3, `Gastos ${MONTHS[filterMonth]}`);

    const goalsData = goals.map((g) => ({
      Meta: g.name,
      'Objetivo ($)': g.target,
      'Ahorrado ($)': g.current,
      'Restante ($)': Math.max(0, g.target - g.current),
      Progreso: g.target > 0 ? ((g.current / g.target) * 100).toFixed(1) + '%' : '0%',
    }));
    const ws4 = XLSX.utils.json_to_sheet(goalsData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Metas');

    const filename = `mis_finanzas_${MONTHS[filterMonth]}_${filterYear}.xlsx`;
    XLSX.writeFile(wb, filename);
    showToast(`✓ Exportado como ${filename}`);
  };

  const addGoal = ({ name, target, current, color }) => {
    const goal = {
      id: Date.now().toString(),
      name: name.trim(),
      target: Number(target),
      current: Number(current) || 0,
      color: color || 'teal',
    };
    setGoals((prev) => [...prev, goal]);
    showToast('✓ Meta creada');
  };

  const depositGoal = (id, amount) => {
    const amt = Number(amount);
    if (!amt || isNaN(amt) || amt <= 0) return false;
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, current: g.current + amt } : g)),
    );
    showToast('✓ Depósito registrado');
    return true;
  };

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Meta eliminada');
  };

  return (
    <>
      <Sidebar
        view={view}
        setView={setView}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        years={years}
        onExport={handleExport}
      />

<main className="main">
        {view === 'dashboard' && <DashboardView title={`${MONTHS[filterMonth]} ${filterYear}`} totals={totals} monthTxs={monthTxs} monthlyHistory={monthlyHistory} canvasRef={canvasRef} onDeleteTx={deleteTx} />}
        {view === 'transactions' && (
          <TransactionsView
            txFilterType={txFilterType}
            setTxFilterType={setTxFilterType}
            txFilterCat={txFilterCat}
            setTxFilterCat={setTxFilterCat}
            fullFiltered={fullFiltered}
            onDeleteTx={deleteTx}
          />
        )}
        {view === 'add' && <AddTransactionView addType={addType} setAddType={setAddType} form={form} setForm={setForm} onAddTransaction={addTransaction} />}
        {view === 'goals' && <GoalsView goals={goals} onAddGoal={addGoal} onDepositGoal={depositGoal} onDeleteGoal={deleteGoal} />}
        <div className="main__content">
          {view === 'dashboard' && <DashboardView title={`${MONTHS[filterMonth]} ${filterYear}`} totals={totals} monthTxs={monthTxs} monthlyHistory={monthlyHistory} canvasRef={canvasRef} onDeleteTx={deleteTx} />}
          {view === 'transactions' && (
            <TransactionsView
              txFilterType={txFilterType}
              setTxFilterType={setTxFilterType}
              txFilterCat={txFilterCat}
              setTxFilterCat={setTxFilterCat}
              fullFiltered={fullFiltered}
              onDeleteTx={deleteTx}
            />
          )}
          {view === 'add' && <AddTransactionView addType={addType} setAddType={setAddType} form={form} setForm={setForm} onAddTransaction={addTransaction} />}
          {view === 'goals' && <GoalsView goals={goals} onAddGoal={addGoal} onDepositGoal={depositGoal} onDeleteGoal={deleteGoal} />}
        </div>
        <footer
          style={{
            borderTop: '1px solid #E8ECF0',
            padding: '10px 18px',
            textAlign: 'center',
            fontSize: 11,
            color: '#94A3B8',
            background: '#fff',
            marginTop: 'auto',
            flexShrink: 0,
          }}
        >
          © {new Date().getFullYear()} Organizador de Finanzas · Todos los derechos reservados Daniel Solano Godoy 🐥
        </footer>
      </main>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}


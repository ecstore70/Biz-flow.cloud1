import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useRef } from 'react';
import { formatMoney } from '../services/translationService';
import { useToast } from './ToastContext';
import { supabase } from '../services/supabaseClient';
import { analyzeReceiptImage } from '../services/geminiService';
export const FinanceManager = ({ currency, t, userId }) => {
    const [transactions, setTransactions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [timeRange, setTimeRange] = useState('WEEK');
    const [hoveredData, setHoveredData] = useState(null);
    const { notify } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef(null);
    // Form State
    const [newTrans, setNewTrans] = useState({
        type: 'INCOME',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });
    useEffect(() => {
        if (userId) {
            fetchTransactions();
        }
    }, [userId]);
    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });
            if (error)
                throw error;
            if (data) {
                const mapped = data.map((d) => ({
                    id: d.id,
                    type: d.type,
                    amount: Number(d.amount),
                    description: d.description,
                    category: d.category || 'Geral',
                    date: d.date,
                    timestamp: new Date(d.created_at).getTime()
                }));
                setTransactions(mapped);
            }
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
            notify('Erro ao carregar finanças', 'error');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAdd = async (e) => {
        if (e)
            e.preventDefault();
        if (!newTrans.amount || !newTrans.description)
            return;
        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert({
                user_id: userId,
                type: newTrans.type,
                amount: parseFloat(newTrans.amount),
                description: newTrans.description,
                category: newTrans.category || 'Geral',
                date: newTrans.date
            })
                .select();
            if (error)
                throw error;
            notify('Transação adicionada com sucesso!', 'success');
            setNewTrans({ ...newTrans, amount: '', description: '' });
            setShowForm(false);
            fetchTransactions();
        }
        catch (error) {
            notify('Erro ao salvar transação: ' + error.message, 'error');
        }
    };
    const handleScanReceipt = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setIsScanning(true);
        setShowForm(true);
        notify("Analisando recibo com IA...", "info");
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result;
                const data = await analyzeReceiptImage(base64);
                if (data) {
                    setNewTrans({
                        type: 'EXPENSE',
                        amount: data.amount.toString(),
                        description: data.description,
                        category: data.category,
                        date: data.date
                    });
                    notify("Dados extraídos com sucesso!", "success");
                }
                else {
                    notify("Não foi possível ler o recibo. Tente preencher manualmente.", "error");
                }
                setIsScanning(false);
            };
            reader.readAsDataURL(file);
        }
        catch (error) {
            notify("Erro ao processar imagem.", "error");
            setIsScanning(false);
        }
    };
    const handleDelete = async (id) => {
        if (confirm('Remover esta transação?')) {
            try {
                const { error } = await supabase
                    .from('transactions')
                    .delete()
                    .eq('id', id);
                if (error)
                    throw error;
                notify('Transação removida.', 'info');
                fetchTransactions();
            }
            catch (error) {
                notify('Erro ao remover: ' + error.message, 'error');
            }
        }
    };
    const processedData = useMemo(() => {
        const today = new Date();
        let groupingMap = new Map();
        if (timeRange === 'WEEK') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const key = d.toISOString().split('T')[0];
                const label = `${d.getDate()}/${d.getMonth() + 1}`;
                groupingMap.set(key, { income: 0, expense: 0, label, dateFull: key });
            }
        }
        else if (timeRange === 'MONTH') {
            const year = today.getFullYear();
            const month = today.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const label = String(i);
                groupingMap.set(key, { income: 0, expense: 0, label, dateFull: key });
            }
        }
        else if (timeRange === 'YEAR') {
            const year = today.getFullYear();
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            for (let i = 0; i < 12; i++) {
                const key = `${year}-${String(i + 1).padStart(2, '0')}`;
                groupingMap.set(key, { income: 0, expense: 0, label: monthNames[i], dateFull: key });
            }
        }
        transactions.forEach(tr => {
            const trDate = new Date(tr.date);
            let key = '';
            if (timeRange === 'YEAR') {
                if (trDate.getFullYear() === today.getFullYear()) {
                    key = `${trDate.getFullYear()}-${String(trDate.getMonth() + 1).padStart(2, '0')}`;
                }
            }
            else {
                key = tr.date;
            }
            if (groupingMap.has(key)) {
                const entry = groupingMap.get(key);
                if (tr.type === 'INCOME')
                    entry.income += tr.amount;
                else
                    entry.expense += tr.amount;
            }
        });
        const data = Array.from(groupingMap.values());
        const maxIncome = Math.max(...data.map(d => d.income), 1);
        const maxExpense = Math.max(...data.map(d => d.expense), 1);
        return { data, maxIncome, maxExpense, maxValue: Math.max(maxIncome, maxExpense) };
    }, [transactions, timeRange]);
    const totalIncome = transactions.reduce((sum, t) => t.type === 'INCOME' ? sum + t.amount : sum, 0);
    const totalExpense = transactions.reduce((sum, t) => t.type === 'EXPENSE' ? sum + t.amount : sum, 0);
    const balance = totalIncome - totalExpense;
    const CHART_HEIGHT = 220;
    const CHART_WIDTH = 800;
    const BAR_WIDTH = timeRange === 'MONTH' ? 12 : 20;
    const GAP = timeRange === 'MONTH' ? 4 : 10;
    return (_jsxs("div", { className: "animate-[fadeIn_0.3s_ease-out] max-w-5xl mx-auto pb-20", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white", children: t('finance') }), _jsx("p", { className: "text-slate-500 dark:text-slate-400", children: "Gest\u00E3o inteligente de fluxo de caixa" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "file", accept: "image/*", capture: "environment", className: "hidden", ref: fileInputRef, onChange: handleScanReceipt }), _jsxs("button", { onClick: () => fileInputRef.current?.click(), className: "bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg flex items-center gap-2", children: [_jsx("i", { className: "fa-solid fa-camera" }), " Scan Recibo"] }), _jsxs("button", { onClick: () => setShowForm(!showForm), className: "bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 flex items-center gap-2", children: [_jsx("i", { className: "fa-solid fa-plus" }), " ", t('newTransaction')] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group", children: [_jsx("div", { className: "absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity", children: _jsx("i", { className: "fa-solid fa-wallet text-6xl text-blue-600" }) }), _jsx("p", { className: "text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider", children: t('balance') }), isLoading ? (_jsx("div", { className: "h-8 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded mt-2" })) : (_jsx("p", { className: `text-3xl font-black mt-2 ${balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`, children: formatMoney(balance, currency) }))] }), _jsxs("div", { className: "bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden", children: [_jsx("div", { className: "absolute right-0 top-0 p-4 opacity-10", children: _jsx("i", { className: "fa-solid fa-arrow-trend-up text-6xl text-emerald-500" }) }), _jsx("p", { className: "text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider", children: t('income') }), isLoading ? (_jsx("div", { className: "h-8 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded mt-2" })) : (_jsx("p", { className: "text-3xl font-black mt-2 text-emerald-600", children: formatMoney(totalIncome, currency) }))] }), _jsxs("div", { className: "bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden", children: [_jsx("div", { className: "absolute right-0 top-0 p-4 opacity-10", children: _jsx("i", { className: "fa-solid fa-arrow-trend-down text-6xl text-rose-500" }) }), _jsx("p", { className: "text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider", children: t('expense') }), isLoading ? (_jsx("div", { className: "h-8 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded mt-2" })) : (_jsx("p", { className: "text-3xl font-black mt-2 text-rose-500", children: formatMoney(totalExpense, currency) }))] })] }), showForm && (_jsxs("div", { className: "bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 mb-8 animate-[slideDown_0.2s] relative overflow-hidden", children: [isScanning && (_jsxs("div", { className: "absolute inset-0 bg-blue-600/10 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center animate-pulse", children: [_jsx("i", { className: "fa-solid fa-wand-magic-sparkles text-blue-600 text-3xl mb-2 animate-bounce" }), _jsx("p", { className: "font-black text-blue-700 uppercase tracking-widest text-xs", children: "A analisar recibo com IA..." })] })), _jsx("h3", { className: "font-bold text-slate-900 dark:text-white mb-4", children: t('newTransaction') }), _jsxs("form", { onSubmit: handleAdd, className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1", children: [_jsx("button", { type: "button", onClick: () => setNewTrans({ ...newTrans, type: 'INCOME' }), className: `flex-1 py-2 rounded font-bold text-sm transition-all ${newTrans.type === 'INCOME' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`, children: "Entrada" }), _jsx("button", { type: "button", onClick: () => setNewTrans({ ...newTrans, type: 'EXPENSE' }), className: `flex-1 py-2 rounded font-bold text-sm transition-all ${newTrans.type === 'EXPENSE' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`, children: "Sa\u00EDda" })] }), _jsx("input", { required: true, type: "date", value: newTrans.date, onChange: e => setNewTrans({ ...newTrans, date: e.target.value }), className: "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 dark:text-white" }), _jsx("input", { required: true, type: "text", placeholder: t('description'), value: newTrans.description, onChange: e => setNewTrans({ ...newTrans, description: e.target.value }), className: "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 dark:text-white" }), _jsx("input", { required: true, type: "number", step: "any", placeholder: "Valor", value: newTrans.amount, onChange: e => setNewTrans({ ...newTrans, amount: e.target.value }), className: "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 dark:text-white" }), _jsx("input", { type: "text", placeholder: t('category'), value: newTrans.category, onChange: e => setNewTrans({ ...newTrans, category: e.target.value }), className: "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 md:col-span-2 dark:text-white" }), _jsx("button", { className: "md:col-span-2 bg-slate-900 dark:bg-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition", children: t('save') })] })] })), _jsxs("div", { className: "bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8 shadow-sm", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h3", { className: "font-bold text-slate-900 dark:text-white", children: "An\u00E1lise Financeira" }), _jsxs("div", { className: "flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg", children: [_jsx("button", { onClick: () => setTimeRange('WEEK'), className: `px-3 py-1 text-xs font-bold rounded-md transition-colors ${timeRange === 'WEEK' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`, children: "Semana" }), _jsx("button", { onClick: () => setTimeRange('MONTH'), className: `px-3 py-1 text-xs font-bold rounded-md transition-colors ${timeRange === 'MONTH' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`, children: "M\u00EAs" }), _jsx("button", { onClick: () => setTimeRange('YEAR'), className: `px-3 py-1 text-xs font-bold rounded-md transition-colors ${timeRange === 'YEAR' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`, children: "Ano" })] })] }), _jsx("div", { className: "w-full overflow-x-auto", children: _jsxs("div", { className: "min-w-[600px] h-[250px] relative", children: [_jsxs("svg", { viewBox: `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`, className: "w-full h-full", preserveAspectRatio: "none", children: [[0, 0.25, 0.5, 0.75, 1].map(tick => (_jsx("line", { x1: "0", y1: CHART_HEIGHT * tick, x2: CHART_WIDTH, y2: CHART_HEIGHT * tick, stroke: "#e2e8f0", strokeDasharray: "4 4", strokeWidth: "1", className: "dark:stroke-slate-800" }, tick))), processedData.data.map((d, i) => {
                                            const x = (i * (CHART_WIDTH / processedData.data.length)) + (CHART_WIDTH / processedData.data.length / 2) - BAR_WIDTH;
                                            const incomeH = (d.income / processedData.maxValue) * (CHART_HEIGHT * 0.85);
                                            const expenseH = (d.expense / processedData.maxValue) * (CHART_HEIGHT * 0.85);
                                            return (_jsxs("g", { onMouseEnter: () => setHoveredData(d), onMouseLeave: () => setHoveredData(null), children: [_jsx("rect", { x: x, y: CHART_HEIGHT - incomeH - 20, width: BAR_WIDTH, height: Math.max(incomeH, 0), className: "fill-emerald-500 hover:fill-emerald-400 transition-all cursor-pointer", rx: "4" }), _jsx("rect", { x: x + BAR_WIDTH + GAP, y: CHART_HEIGHT - expenseH - 20, width: BAR_WIDTH, height: Math.max(expenseH, 0), className: "fill-rose-500 hover:fill-rose-400 transition-all cursor-pointer", rx: "4" }), _jsx("text", { x: x + BAR_WIDTH, y: CHART_HEIGHT, fontSize: "12", textAnchor: "middle", className: "fill-slate-400 font-sans", children: d.label })] }, i));
                                        })] }), hoveredData && (_jsxs("div", { className: "absolute top-0 right-0 bg-slate-900/90 text-white p-3 rounded-lg shadow-lg pointer-events-none backdrop-blur-sm z-10 text-sm", children: [_jsx("p", { className: "font-bold mb-1 text-slate-300 border-b border-slate-700 pb-1", children: hoveredData.label }), _jsxs("div", { className: "flex justify-between gap-4 text-emerald-400", children: [_jsx("span", { children: "Entrada:" }), _jsx("span", { className: "font-mono", children: formatMoney(hoveredData.income, currency) })] }), _jsxs("div", { className: "flex justify-between gap-4 text-rose-400", children: [_jsx("span", { children: "Sa\u00EDda:" }), _jsx("span", { className: "font-mono", children: formatMoney(hoveredData.expense, currency) })] })] }))] }) })] }), _jsx("div", { className: "bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden", children: _jsxs("table", { className: "w-full text-left border-collapse", children: [_jsx("thead", { className: "bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-400 font-bold", children: _jsxs("tr", { children: [_jsx("th", { className: "p-4 hidden sm:table-cell", children: t('date') }), _jsx("th", { className: "p-4", children: t('description') }), _jsx("th", { className: "p-4 text-right", children: t('total') }), _jsx("th", { className: "p-4 text-center" })] }) }), _jsx("tbody", { className: "text-sm dark:text-slate-300", children: transactions.slice(0, 15).map((t) => (_jsxs("tr", { className: "border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition", children: [_jsx("td", { className: "p-4 hidden sm:table-cell whitespace-nowrap text-slate-500", children: t.date }), _jsxs("td", { className: "p-4", children: [_jsx("div", { className: "font-medium text-slate-800 dark:text-white", children: t.description }), _jsxs("div", { className: "sm:hidden text-xs text-slate-400", children: [t.date, " \u2022 ", t.category] })] }), _jsxs("td", { className: `p-4 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-500'}`, children: [t.type === 'INCOME' ? '+' : '-', " ", formatMoney(t.amount, currency)] }), _jsx("td", { className: "p-4 text-center", children: _jsx("button", { onClick: () => handleDelete(t.id), className: "text-slate-300 hover:text-rose-500 transition p-2", children: _jsx("i", { className: "fa-solid fa-trash" }) }) })] }, t.id))) })] }) })] }));
};

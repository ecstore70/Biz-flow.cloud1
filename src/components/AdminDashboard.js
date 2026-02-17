import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getPendingRequests, approveRequest, rejectRequest } from '../services/paymentService';
import { useToast } from './ToastContext';
export const AdminDashboard = ({ onClose }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const { notify } = useToast();
    const loadData = async () => {
        setLoading(true);
        const data = await getPendingRequests();
        setRequests(data);
        setLoading(false);
    };
    useEffect(() => {
        loadData();
    }, []);
    const handleApprove = async (req) => {
        if (!confirm(`Aprovar PRO para ${req.user_name}?`))
            return;
        const success = await approveRequest(req.id, req.user_id);
        if (success) {
            notify(`Plano PRO ativado para ${req.user_name}`, 'success');
            loadData(); // Reload list
        }
        else {
            notify("Erro ao aprovar.", 'error');
        }
    };
    const handleReject = async (id) => {
        if (!confirm("Rejeitar solicitação?"))
            return;
        const success = await rejectRequest(id);
        if (success) {
            notify("Solicitação rejeitada.", 'info');
            loadData();
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-slate-900 z-50 overflow-y-auto animate-fadeIn text-slate-900", children: _jsxs("div", { className: "min-h-screen bg-slate-50 dark:bg-slate-900", children: [_jsxs("div", { className: "bg-slate-900 text-white p-6 flex justify-between items-center sticky top-0 z-10 shadow-md", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold", children: _jsx("i", { className: "fa-solid fa-lock" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold tracking-tight", children: "Painel Admin" }), _jsx("p", { className: "text-xs text-slate-400", children: "Gerenciamento de Pagamentos Manuais" })] })] }), _jsx("button", { onClick: onClose, className: "px-4 py-2 bg-slate-800 rounded-lg text-sm font-bold hover:bg-slate-700", children: "Sair do Admin" })] }), _jsxs("div", { className: "max-w-6xl mx-auto p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-2xl font-bold dark:text-white", children: "Solicita\u00E7\u00F5es Pendentes" }), _jsx("button", { onClick: loadData, className: "w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600", children: _jsx("i", { className: `fa-solid fa-rotate ${loading ? 'animate-spin' : ''}` }) })] }), requests.length === 0 ? (_jsxs("div", { className: "text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700", children: [_jsx("i", { className: "fa-solid fa-check-circle text-6xl text-emerald-100 dark:text-emerald-900/30 mb-4" }), _jsx("h3", { className: "text-xl font-bold text-slate-700 dark:text-slate-200", children: "Tudo limpo!" }), _jsx("p", { className: "text-slate-400", children: "Nenhuma solicita\u00E7\u00E3o de pagamento pendente." })] })) : (_jsx("div", { className: "grid gap-6", children: requests.map(req => (_jsxs("div", { className: "bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-6 items-start md:items-center", children: [_jsxs("div", { className: "w-full md:w-48 h-32 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group flex-none", children: [_jsx("img", { src: req.proof_url, alt: "Comprovativo", className: "w-full h-full object-cover" }), _jsxs("a", { href: req.proof_url, target: "_blank", rel: "noreferrer", className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition", children: [_jsx("i", { className: "fa-solid fa-eye mr-2" }), " Ver"] })] }), _jsxs("div", { className: "flex-grow", children: [_jsx("h3", { className: "text-lg font-bold dark:text-white", children: req.user_name }), _jsx("p", { className: "text-xs text-slate-500 font-mono mb-2", children: req.user_id }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded", children: "Pendente" }), _jsx("span", { className: "text-slate-400 text-xs", children: new Date(req.created_at).toLocaleDateString() })] })] }), _jsxs("div", { className: "flex gap-3 w-full md:w-auto", children: [_jsx("button", { onClick: () => handleReject(req.id), className: "flex-1 md:flex-none px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition", children: "Rejeitar" }), _jsxs("button", { onClick: () => handleApprove(req), className: "flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2", children: [_jsx("i", { className: "fa-solid fa-check" }), " Aprovar PRO"] })] })] }, req.id))) }))] })] }) }));
};

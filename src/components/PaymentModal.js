import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useToast } from './ToastContext';
import { uploadPaymentProof } from '../services/paymentService';
export const PaymentModal = ({ onClose, userEmail = '', userName = '', userId = '' }) => {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const { notify } = useToast();
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    const handleValidate = async () => {
        if (!file) {
            notify("Por favor, anexe o comprovativo antes de validar.", "error");
            return;
        }
        if (!userId) {
            notify("Erro de identificação do usuário. Faça login novamente.", "error");
            return;
        }
        setLoading(true);
        try {
            const success = await uploadPaymentProof(file, userId, userName || userEmail);
            if (success) {
                notify("Comprovativo enviado! Vamos analisar e ativar seu PRO em breve.", "success");
                onClose();
            }
            else {
                notify("Erro ao enviar. Tente novamente ou contate o suporte.", "error");
            }
        }
        catch (e) {
            notify("Erro de conexão.", "error");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[80] flex items-center justify-center p-4 animate-fadeIn", children: _jsxs("div", { className: "bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scaleIn", children: [_jsxs("div", { className: "bg-slate-50 dark:bg-slate-800 p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-slate-900 dark:text-white text-lg", children: "Ativa\u00E7\u00E3o PRO" }), _jsxs("p", { className: "text-xs text-slate-500 dark:text-slate-400", children: ["Plano PRO: ", _jsx("span", { className: "font-black text-slate-900 dark:text-white", children: "2.00 USD (130 MT)" })] })] }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-slate-600 dark:hover:text-white", children: _jsx("i", { className: "fa-solid fa-times text-xl" }) })] }), _jsxs("div", { className: "p-6 space-y-8", children: [_jsxs("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800", children: [_jsx("h4", { className: "font-bold text-blue-800 dark:text-blue-300 text-sm mb-1", children: "Pagamento Manual" }), _jsx("p", { className: "text-xs text-blue-600 dark:text-blue-400 leading-relaxed", children: "Realize o pagamento atrav\u00E9s dos canais oficiais (M-Pesa, Transfer\u00EAncia Banc\u00E1ria). Ap\u00F3s o pagamento, anexe o comprovativo abaixo para ativa\u00E7\u00E3o pela nossa equipe." })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-bold text-slate-700 dark:text-slate-200 text-sm uppercase", children: "Anexar Comprovativo" }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 leading-relaxed", children: "Envie o recibo ou captura de tela da transfer\u00EAncia." }), _jsxs("div", { className: "relative group", children: [_jsx("input", { type: "file", accept: "image/*,application/pdf", onChange: handleFileChange, className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" }), _jsx("div", { className: `border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors ${file ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'}`, children: file ? (_jsxs(_Fragment, { children: [_jsx("i", { className: "fa-solid fa-check-circle text-2xl text-emerald-500 mb-2" }), _jsx("span", { className: "text-xs font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-[200px]", children: file.name }), _jsx("span", { className: "text-[10px] text-emerald-600/70", children: "Clique para alterar" })] })) : (_jsxs(_Fragment, { children: [_jsx("i", { className: "fa-solid fa-cloud-arrow-up text-3xl text-slate-400 mb-3 group-hover:text-blue-500 transition-colors" }), _jsx("span", { className: "text-xs font-bold text-slate-600 dark:text-slate-300", children: "Toque para enviar comprovativo" }), _jsx("span", { className: "text-[10px] text-slate-400", children: "PDF, JPG ou PNG" })] })) })] }), _jsxs("button", { onClick: handleValidate, disabled: loading || !file, className: "w-full bg-slate-900 dark:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 dark:hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2", children: [loading ? _jsx("i", { className: "fa-solid fa-circle-notch animate-spin" }) : _jsx("i", { className: "fa-solid fa-check" }), loading ? 'Enviando...' : 'Enviar e Validar'] })] })] })] }) }));
};

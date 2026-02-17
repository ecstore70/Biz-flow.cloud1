import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from 'react';
const ToastContext = createContext(undefined);
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const notify = useCallback((message, type = 'success') => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);
        // Auto dismiss
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);
    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };
    return (_jsxs(ToastContext.Provider, { value: { notify }, children: [children, _jsx("div", { className: "fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none", children: toasts.map((toast) => (_jsxs("div", { className: `pointer-events-auto min-w-[300px] max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl border-l-4 p-4 flex items-start gap-3 transform transition-all duration-300 animate-slideDown ${toast.type === 'success' ? 'border-emerald-500' :
                        toast.type === 'error' ? 'border-red-500' : 'border-blue-500'}`, children: [_jsx("div", { className: `mt-0.5 text-lg ${toast.type === 'success' ? 'text-emerald-500' :
                                toast.type === 'error' ? 'text-red-500' : 'text-blue-500'}`, children: _jsx("i", { className: `fa-solid ${toast.type === 'success' ? 'fa-circle-check' :
                                    toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'}` }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-bold text-slate-900 dark:text-white text-sm capitalize", children: toast.type === 'info' ? 'Informação' : toast.type === 'error' ? 'Erro' : 'Sucesso' }), _jsx("p", { className: "text-slate-600 dark:text-slate-300 text-sm mt-0.5", children: toast.message })] }), _jsx("button", { onClick: () => removeToast(toast.id), className: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200", children: _jsx("i", { className: "fa-solid fa-times" }) })] }, toast.id))) })] }));
};
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

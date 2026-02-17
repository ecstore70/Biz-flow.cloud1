import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { PaymentModal } from './PaymentModal';
import { supabase } from '../services/supabaseClient';
import { isPlayBillingAvailable, getSubscriptionDetails, purchaseSubscription } from '../services/googlePlayService';
import { useToast } from './ToastContext';
export const PricingModal = ({ currentPlan, onClose, onSelectPlan, userEmail, userName }) => {
    const [showPayment, setShowPayment] = useState(false);
    const [userId, setUserId] = useState('');
    // Google Play States
    const [isGooglePlay, setIsGooglePlay] = useState(false);
    const [playDetails, setPlayDetails] = useState(null);
    const [isLoadingPlay, setIsLoadingPlay] = useState(false);
    const { notify } = useToast();
    // Fetch current user ID immediately when modal opens
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUserId(session.user.id);
            }
        });
        // Check Google Play Availability
        const checkGooglePlay = async () => {
            const available = await isPlayBillingAvailable();
            setIsGooglePlay(available);
            if (available) {
                const details = await getSubscriptionDetails();
                setPlayDetails(details);
            }
        };
        checkGooglePlay();
    }, []);
    const handleEnterpriseClick = () => {
        window.open("https://wa.me/258840636794", "_blank");
    };
    const handleProClick = async () => {
        if (isGooglePlay) {
            // Fluxo Google Play
            if (!userId) {
                notify("Faça login para assinar.", "error");
                return;
            }
            setIsLoadingPlay(true);
            const success = await purchaseSubscription(userId);
            if (success) {
                notify("Assinatura PRO ativada com sucesso!", "success");
                onClose();
            }
            else {
                notify("Compra cancelada ou falhou.", "info");
            }
            setIsLoadingPlay(false);
        }
        else {
            // Fluxo Web Manual
            setShowPayment(true);
        }
    };
    if (showPayment) {
        return _jsx(PaymentModal, { onClose: () => setShowPayment(false), userEmail: userEmail, userName: userName, userId: userId });
    }
    return (_jsx("div", { className: "fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[70] flex items-center justify-center p-4 animate-fadeIn overflow-y-auto", children: _jsxs("div", { className: "bg-slate-50 dark:bg-slate-950 w-full max-w-5xl rounded-3xl shadow-2xl relative overflow-hidden animate-scaleIn my-auto", children: [_jsxs("div", { className: "p-8 text-center relative z-10", children: [_jsx("button", { onClick: onClose, className: "absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-300 transition", children: _jsx("i", { className: "fa-solid fa-times" }) }), _jsx("h2", { className: "text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4", children: "Planos e Pre\u00E7os" }), _jsx("p", { className: "text-slate-500 dark:text-slate-400 max-w-2xl mx-auto", children: "Escolha a melhor solu\u00E7\u00E3o para o seu neg\u00F3cio." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 p-8 pt-2 md:p-10", children: [_jsxs("div", { className: "bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative", children: [_jsx("h3", { className: "text-lg font-bold text-slate-500 uppercase tracking-widest mb-2", children: "Assinatura Gratuita" }), _jsxs("div", { className: "text-4xl font-black text-slate-900 dark:text-white mb-4", children: ["$0 ", _jsx("span", { className: "text-sm font-normal text-slate-400", children: "/m\u00EAs" })] }), _jsx("p", { className: "text-sm text-slate-500 mb-6 flex-grow", children: "Plano inicial para pequenos neg\u00F3cios com funcionalidades b\u00E1sicas de fatura\u00E7\u00E3o." }), _jsxs("ul", { className: "space-y-3 mb-8 text-sm text-slate-600 dark:text-slate-300", children: [_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-check text-green-500 mt-1" }), " At\u00E9 10 documentos por dia"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-check text-green-500 mt-1" }), " Gest\u00E3o b\u00E1sica de clientes"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-check text-green-500 mt-1" }), " Controle de receitas/despesas"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-check text-green-500 mt-1" }), " Exporta\u00E7\u00E3o PDF limitada"] })] }), _jsx("button", { onClick: () => onClose(), disabled: currentPlan === 'FREE', className: `w-full py-3 rounded-xl font-bold border transition-all ${currentPlan === 'FREE' ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default' : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50'}`, children: currentPlan === 'FREE' ? 'Seu Plano Atual' : 'Voltar ao Grátis' })] }), _jsxs("div", { className: "bg-gradient-to-b from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-xl shadow-blue-900/20 text-white flex flex-col relative transform md:-translate-y-4 md:scale-105 z-10 border border-blue-400/30", children: [_jsx("div", { className: "absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg", children: "POPULAR" }), _jsx("h3", { className: "text-lg font-bold text-blue-100 uppercase tracking-widest mb-2", children: "Assinatura PRO" }), _jsxs("div", { className: "flex items-baseline gap-2 mb-1", children: [_jsx("span", { className: "text-4xl font-black", children: playDetails ? playDetails.price.value : '$2.00' }), _jsx("span", { className: "text-sm font-normal text-blue-200", children: playDetails ? `/${playDetails.price.currency}` : '/mês' })] }), !playDetails && _jsx("div", { className: "text-xs font-medium text-blue-200 mb-4 opacity-80", children: "(aprox. 130 MT)" }), isGooglePlay && _jsx("div", { className: "text-xs font-bold text-green-300 mb-4 bg-green-900/30 px-2 py-1 rounded inline-block", children: "Cobrado pela Google Play" }), _jsx("p", { className: "text-sm text-blue-100 mb-6 flex-grow opacity-90", children: "Solu\u00E7\u00E3o completa sem limites para empresas em crescimento." }), _jsxs("ul", { className: "space-y-3 mb-8 text-sm text-white font-medium", children: [_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-circle-check text-yellow-400 mt-1" }), " ", _jsx("strong", { children: "Documentos Ilimitados" })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-check text-blue-300 mt-1" }), " Venda de E-books e Links"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-check text-blue-300 mt-1" }), " Relat\u00F3rios financeiros detalhados"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-check text-blue-300 mt-1" }), " Multi-moeda + convers\u00E3o auto"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-check text-blue-300 mt-1" }), " Backup di\u00E1rio autom\u00E1tico"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-check text-blue-300 mt-1" }), " Suporte priorit\u00E1rio 24/7"] })] }), _jsxs("button", { onClick: handleProClick, disabled: currentPlan === 'PRO' || isLoadingPlay, className: "w-full bg-white text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95 disabled:opacity-80 disabled:cursor-default flex items-center justify-center gap-2", children: [isLoadingPlay ? _jsx("i", { className: "fa-solid fa-circle-notch animate-spin" }) : null, currentPlan === 'PRO' ? 'Plano Ativo' : (isGooglePlay ? 'Assinar via Google Play' : 'Assinar Agora')] })] }), _jsxs("div", { className: "bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative", children: [_jsx("h3", { className: "text-lg font-bold text-slate-500 uppercase tracking-widest mb-2", children: "Assinatura Empresarial" }), _jsx("div", { className: "text-3xl font-black text-slate-900 dark:text-white mb-4 mt-1", children: "Sob Consulta" }), _jsx("p", { className: "text-sm text-slate-500 mb-6 flex-grow", children: "Solu\u00E7\u00E3o personalizada para grandes volumes, com API e gestor dedicado." }), _jsxs("ul", { className: "space-y-3 mb-8 text-sm text-slate-600 dark:text-slate-300", children: [_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-check text-slate-400 mt-1" }), " Tudo do plano PRO"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-check text-slate-400 mt-1" }), " M\u00FAltiplos utilizadores (Multi-seat)"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-check text-slate-400 mt-1" }), " Integra\u00E7\u00E3o via API (ERP/CRM)"] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("i", { className: "fa-solid fa-check text-slate-400 mt-1" }), " Gestor de conta dedicado"] })] }), _jsxs("button", { onClick: handleEnterpriseClick, className: "w-full py-3 rounded-xl font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2", children: [_jsx("i", { className: "fa-brands fa-whatsapp text-green-500 text-lg" }), " Falar com Vendas"] })] })] }), _jsx("div", { className: "bg-slate-100 dark:bg-slate-900 p-4 text-center text-xs text-slate-400", children: "Cancelamento dispon\u00EDvel a qualquer momento. Reembolsos apenas em caso de falha t\u00E9cnica comprovada." })] }) }));
};

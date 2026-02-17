import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { getComments, saveComment } from '../services/storageService';
export const CommunityFeed = ({ currentUser, t }) => {
    const [comments, setComments] = useState([]);
    const [newContent, setNewContent] = useState('');
    useEffect(() => {
        setComments(getComments());
    }, []);
    const handlePost = (e) => {
        e.preventDefault();
        if (!newContent.trim())
            return;
        const newComment = {
            id: crypto.randomUUID(),
            userName: currentUser.name || 'Usuário Anônimo',
            userLogo: currentUser.logo,
            content: newContent,
            timestamp: Date.now(),
            location: currentUser.address ? currentUser.address.split(',')[0] : 'Desconhecido',
            likes: 0
        };
        const updated = saveComment(newComment);
        setComments(updated);
        setNewContent('');
    };
    const formatTime = (ts) => {
        const seconds = Math.floor((Date.now() - ts) / 1000);
        if (seconds < 60)
            return 'agora mesmo';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60)
            return `${minutes}m atrás`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24)
            return `${hours}h atrás`;
        const days = Math.floor(hours / 24);
        return `${days}d atrás`;
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto pb-20 animate-[fadeIn_0.3s_ease-out]", children: [_jsxs("div", { className: "mb-8 text-center md:text-left", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white", children: "Comunidade Biz-flow" }), _jsx("p", { className: "text-slate-500 dark:text-slate-400", children: "Conecte-se com outros empreendedores e tire d\u00FAvidas." })] }), _jsxs("div", { className: "bg-[#25D366]/10 dark:bg-[#25D366]/5 border border-[#25D366]/30 dark:border-[#25D366]/20 rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-center gap-6 shadow-sm", children: [_jsx("div", { className: "w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center text-white text-3xl shadow-lg shadow-[#25D366]/30 flex-none animate-[pulse_3s_infinite]", children: _jsx("i", { className: "fa-brands fa-whatsapp" }) }), _jsxs("div", { className: "flex-grow text-center md:text-left", children: [_jsx("h3", { className: "font-bold text-slate-900 dark:text-white text-lg", children: "Grupo Oficial do WhatsApp" }), _jsx("p", { className: "text-slate-600 dark:text-slate-300 text-sm mt-1 mb-4 md:mb-0 max-w-md", children: t('whatsappPromo') })] }), _jsxs("a", { href: "https://chat.whatsapp.com/HCqTa1jG2cU3sufJww1EPT?mode=wwt", target: "_blank", rel: "noopener noreferrer", className: "bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/20 hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap", children: [_jsx("i", { className: "fa-brands fa-whatsapp text-lg" }), t('joinCommunity')] })] }), _jsxs("div", { className: "bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8", children: [_jsx("h4", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest mb-4", children: "Atividade Recente" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-none flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700", children: currentUser.logo ? (_jsx("img", { src: currentUser.logo, alt: "Me", className: "w-full h-full object-cover" })) : (_jsx("span", { className: "font-bold text-blue-600 dark:text-blue-400", children: currentUser.name?.substring(0, 2).toUpperCase() || 'EU' })) }), _jsxs("form", { onSubmit: handlePost, className: "flex-grow", children: [_jsx("textarea", { value: newContent, onChange: (e) => setNewContent(e.target.value), placeholder: "O que voc\u00EA est\u00E1 pensando? Compartilhe uma dica ou d\u00FAvida...", className: "w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[80px]" }), _jsx("div", { className: "flex justify-end mt-2", children: _jsx("button", { type: "submit", disabled: !newContent.trim(), className: "bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50", children: "Publicar" }) })] })] })] }), _jsx("div", { className: "space-y-4", children: comments.map(comment => (_jsx("div", { className: "bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800", children: _jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex-none flex items-center justify-center overflow-hidden", children: comment.userLogo ? (_jsx("img", { src: comment.userLogo, alt: comment.userName, className: "w-full h-full object-cover" })) : (_jsx("i", { className: "fa-solid fa-user text-slate-400" })) }), _jsxs("div", { className: "flex-grow", children: [_jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-slate-900 dark:text-white text-sm", children: comment.userName }), _jsxs("p", { className: "text-xs text-slate-400", children: [comment.location, " \u2022 ", formatTime(comment.timestamp)] })] }) }), _jsx("p", { className: "text-slate-700 dark:text-slate-300 mt-2 text-sm leading-relaxed", children: comment.content }), _jsxs("div", { className: "flex items-center gap-4 mt-4 text-xs font-bold text-slate-400 dark:text-slate-500", children: [_jsxs("button", { className: "flex items-center gap-1.5 hover:text-red-500 transition", children: [_jsx("i", { className: "fa-regular fa-heart" }), " ", comment.likes] }), _jsxs("button", { className: "flex items-center gap-1.5 hover:text-blue-600 transition", children: [_jsx("i", { className: "fa-regular fa-comment" }), " Responder"] })] })] })] }) }, comment.id))) })] }));
};

const STORAGE_KEY = 'bizflow_receipts_v1';
const SETTINGS_KEY = 'bizflow_settings_v1';
const COMMENTS_KEY = 'bizflow_comments_v1';
const TRANSACTIONS_KEY = 'bizflow_transactions_v1';
const CLIENTS_KEY = 'bizflow_clients_db';
const PRODUCTS_KEY = 'bizflow_products_db';
// --- GESTÃO DE DIRETÓRIOS LOCAIS (File System Access API) ---
export const saveDirectoryHandle = async (handle) => {
    try {
        const db = await openDB();
        const tx = db.transaction('handles', 'readwrite');
        await tx.objectStore('handles').put(handle, 'default_dir');
    }
    catch (e) {
        console.error("Erro ao guardar handle da pasta", e);
    }
};
export const getDirectoryHandle = async () => {
    try {
        const db = await openDB();
        const tx = db.transaction('handles', 'readonly');
        return await tx.objectStore('handles').get('default_dir');
    }
    catch (e) {
        return null;
    }
};
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BizFlow_NativeStorage', 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore('handles');
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};
// --- CLIENTES SALVOS ---
export const getSavedClients = (userId) => {
    if (!userId)
        return [];
    try {
        const key = `${CLIENTS_KEY}_${userId}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    }
    catch (e) {
        return [];
    }
};
export const getSavedProducts = (userId) => {
    if (!userId)
        return [];
    try {
        const key = `${PRODUCTS_KEY}_${userId}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    }
    catch (e) {
        return [];
    }
};
const learnClient = (doc, userId) => {
    if (!doc.clientName || !userId)
        return;
    try {
        const clients = getSavedClients(userId);
        const exists = clients.find(c => c.name.toLowerCase() === doc.clientName.toLowerCase());
        if (!exists) {
            const newClient = {
                name: doc.clientName,
                contact: doc.clientContact,
                nuit: doc.clientNuit,
                location: doc.clientLocation
            };
            localStorage.setItem(`${CLIENTS_KEY}_${userId}`, JSON.stringify([...clients, newClient]));
        }
    }
    catch (e) { }
};
const learnProducts = (doc, userId) => {
    if (!userId)
        return;
    try {
        const products = getSavedProducts(userId);
        let updated = false;
        doc.items.forEach(item => {
            if (!item.description)
                return;
            const exists = products.find(p => p.description.toLowerCase() === item.description.toLowerCase());
            if (!exists) {
                products.push({ description: item.description, unitPrice: item.unitPrice });
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem(`${PRODUCTS_KEY}_${userId}`, JSON.stringify(products));
        }
    }
    catch (e) { }
};
export const saveReceipt = (receipt, userId) => {
    if (!userId)
        return [];
    try {
        const existing = getHistory(userId);
        const index = existing.findIndex(r => r.id === receipt.id);
        let newHistory;
        if (index >= 0) {
            newHistory = [...existing];
            newHistory[index] = receipt;
        }
        else {
            newHistory = [receipt, ...existing];
        }
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(newHistory));
        learnClient(receipt, userId);
        learnProducts(receipt, userId);
        return newHistory;
    }
    catch (e) {
        return [];
    }
};
export const deleteReceipt = (id, userId) => {
    if (!userId)
        return [];
    try {
        const current = getHistory(userId);
        const updated = current.filter(r => r.id !== id);
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
        return updated;
    }
    catch (e) {
        return [];
    }
};
export const getHistory = (userId) => {
    if (!userId)
        return [];
    try {
        const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
        if (!stored)
            return [];
        return JSON.parse(stored);
    }
    catch (e) {
        return [];
    }
};
export const checkDailyLimit = (userId) => {
    // Aplicativo agora é gratuito e ilimitado para todos
    return true;
};
export const generateNextReceiptNumber = (history, type) => {
    let prefix = type === 'INVOICE' ? 'FAT' : type === 'QUOTE' ? 'COT' : 'REC';
    const typeHistory = history.filter(h => (h.type || 'RECEIPT') === type);
    if (typeHistory.length === 0)
        return `${prefix}-0001`;
    const latest = typeHistory[0].number;
    const parts = latest.split('-');
    if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num))
            return `${prefix}-${(num + 1).toString().padStart(4, '0')}`;
    }
    return `${prefix}-${(typeHistory.length + 1).toString().padStart(4, '0')}`;
};
export const saveCompanySettings = (settings, userId) => {
    if (!userId)
        return;
    localStorage.setItem(`${SETTINGS_KEY}_${userId}`, JSON.stringify(settings));
};
export const getCompanySettings = (userId) => {
    if (!userId)
        return null;
    const stored = localStorage.getItem(`${SETTINGS_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : null;
};
export const getComments = () => {
    const stored = localStorage.getItem(COMMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
};
export const saveComment = (comment) => {
    const current = getComments();
    const updated = [comment, ...current];
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
    return updated;
};
export const getTransactions = (userId) => {
    if (!userId)
        return [];
    const stored = localStorage.getItem(`${TRANSACTIONS_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : [];
};
export const addTransaction = (t, userId) => {
    if (!userId)
        return [];
    const current = getTransactions(userId);
    const updated = [t, ...current];
    localStorage.setItem(`${TRANSACTIONS_KEY}_${userId}`, JSON.stringify(updated));
    return updated;
};

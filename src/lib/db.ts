const DB_NAME = "visao-do-oculto";
const DB_VERSION = 2; 

export function abrirDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            
            if (!db.objectStoreNames.contains("dados")) db.createObjectStore("dados");
            if (!db.objectStoreNames.contains("fontes")) db.createObjectStore("fontes");
            if (!db.objectStoreNames.contains("pdfs")) db.createObjectStore("pdfs");
            
            if (!db.objectStoreNames.contains("favoritos")) db.createObjectStore("favoritos");
            if (!db.objectStoreNames.contains("grupos")) db.createObjectStore("grupos");
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function dbGet<T>(store: string, key: string): Promise<T | undefined> {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
    });
}

export async function dbSet(store: string, key: string, value: unknown): Promise<void> {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function dbDelete(store: string, key: string): Promise<void> {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function dbGetAllKeys(store: string): Promise<string[]> {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).getAllKeys();
        req.onsuccess = () => resolve(req.result as string[]);
        req.onerror = () => reject(req.error);
    });
}

export async function dbClear(store: string): Promise<void> {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
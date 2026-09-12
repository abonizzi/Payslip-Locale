// Salvataggio 100% locale nel browser tramite IndexedDB: nessun server,
// nessun account esterno. I dati (e i file PDF/foto originali) restano
// solo su questo dispositivo/browser — cancellando i dati di navigazione
// o disinstallando l'app si perdono definitivamente. Vedi il pulsante
// "Esporta backup" nelle Impostazioni per un salvataggio di riserva.

const DB_NAME = "buste-paga-db";
const DB_VERSION = 1;
const STORE_PAYSLIPS = "payslips";
const STORE_FILES = "files";

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB non disponibile in questo browser."));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PAYSLIPS)) {
        db.createObjectStore(STORE_PAYSLIPS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: "id" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Errore apertura database locale."));
  });
}

function tx(db, storeName, mode) {
  return db.transaction(storeName, mode).objectStore(storeName);
}

export async function getAllPayslips() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const store = tx(db, STORE_PAYSLIPS, "readonly");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

// Salva la riga con i dati estratti + (opzionale) il file originale come
// Blob. Genera un id univoco e lo restituisce insieme alla riga salvata.
export async function addPayslipLocal(row, fileBlob, mediaType, fileName) {
  const db = await openDb();
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const fullRow = { ...row, id, created_at: new Date().toISOString() };

  await new Promise((resolve, reject) => {
    const store = tx(db, STORE_PAYSLIPS, "readwrite");
    const req = store.add(fullRow);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  if (fileBlob) {
    await new Promise((resolve, reject) => {
      const store = tx(db, STORE_FILES, "readwrite");
      const req = store.add({ id, blob: fileBlob, mediaType, fileName });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  return fullRow;
}

export async function getFileRecord(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const store = tx(db, STORE_FILES, "readonly");
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePayslipLocal(id) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const store = tx(db, STORE_PAYSLIPS, "readwrite");
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  await new Promise((resolve, reject) => {
    const store = tx(db, STORE_FILES, "readwrite");
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

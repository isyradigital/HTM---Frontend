/**
 * videoDB.js
 * Uses IndexedDB to store large video files so they don't hit localStorage's 5MB quota.
 * Videos are stored as Blobs and referenced by a unique key in the course data.
 */

const DB_NAME = "hospital_video_db";
const STORE = "videos";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE);
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

/** Save a base64 dataURL as a Blob in IndexedDB. Returns the key. */
export async function saveVideoToDB(base64DataUrl) {
  const key = `video_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    // Convert base64 → Blob
    const byteString = atob(base64DataUrl.split(",")[1]);
    const mimeType = base64DataUrl.match(/data:([^;]+)/)?.[1] || "video/mp4";
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
    const blob = new Blob([bytes], { type: mimeType });
    store.put(blob, key);
    tx.oncomplete = () => resolve(key);
    tx.onerror = (e) => reject(e.target.error);
  });
}

/** Load a video from IndexedDB by key. Returns an object URL string. */
export async function loadVideoFromDB(key) {
  if (!key || !key.startsWith("video_")) return null;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(key);
    req.onsuccess = () => {
      const blob = req.result;
      if (blob) resolve(URL.createObjectURL(blob));
      else resolve(null);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

/** Delete a video from IndexedDB by key. */
export async function deleteVideoFromDB(key) {
  if (!key || !key.startsWith("video_")) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

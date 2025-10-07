import { openDB } from 'idb';

const DB_NAME = 'chatAppDB';
const STORE_NAME = 'messages';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'uid' });
      }
    },
  });
};

export const cacheMessages = async (uid, msgs) => {
  const db = await initDB();
  await db.put(STORE_NAME, { uid, msgs });
};

export const getCachedMessages = async (uid) => {
  const db = await initDB();
  const result = await db.get(STORE_NAME, uid);
  return result?.msgs || [];
};

export const mergeAndCacheMessages = async (uid, newMsgs) => {
  const db = await initDB();
  const current = (await db.get(STORE_NAME, uid))?.msgs || [];

  const combined = [...current];
  for (const msg of newMsgs) {
    if (!combined.some(m => m.id === msg.id)) {
      combined.push(msg);
    }
  }

  await db.put(STORE_NAME, { uid, msgs: combined });
  return combined;
};
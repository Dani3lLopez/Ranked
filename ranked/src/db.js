import { openDB } from 'idb';

export const db = await openDB('ranked-db', 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('equipos'))
      db.createObjectStore('equipos', { keyPath: 'id' });

    if (!db.objectStoreNames.contains('actividades'))
      db.createObjectStore('actividades', { keyPath: 'id' });

    if (!db.objectStoreNames.contains('puntajes'))
      db.createObjectStore('puntajes', { keyPath: 'id' });

    if (!db.objectStoreNames.contains('pending_operations'))
      db.createObjectStore('pending_operations', { autoIncrement: true });
  }
});

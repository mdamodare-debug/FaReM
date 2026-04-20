import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('ffma_offline.db');

export const initDatabase = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS activity_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_uuid TEXT UNIQUE,
      activity_type TEXT,
      farmer_id INTEGER,
      date TEXT,
      time TEXT,
      visit_purpose TEXT,
      notes TEXT,
      gps_latitude REAL,
      gps_longitude REAL,
      photos TEXT,
      synced INTEGER DEFAULT 0
    );
  `);
};

export const queueActivity = async (activity) => {
  const { client_uuid, activity_type, farmer_id, date, time, visit_purpose, notes, gps_latitude, gps_longitude, photos } = activity;
  await db.runAsync(
    `INSERT INTO activity_queue (client_uuid, activity_type, farmer_id, date, time, visit_purpose, notes, gps_latitude, gps_longitude, photos) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [client_uuid, activity_type, farmer_id, date, time, visit_purpose, notes, gps_latitude, gps_longitude, JSON.stringify(photos)]
  );
};

export const getUnsyncedActivities = async () => {
  return await db.getAllAsync('SELECT * FROM activity_queue WHERE synced = 0');
};

export const markSynced = async (id) => {
  await db.runAsync('UPDATE activity_queue SET synced = 1 WHERE id = ?', [id]);
};

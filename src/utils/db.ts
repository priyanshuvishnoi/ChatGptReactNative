import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export async function getDB() {
  return SQLite.openDatabase({
    name: "chat.db",
    location: "default",
  });
}

export async function createTable(db: SQLite.SQLiteDatabase) {
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create `messages` table with foreign key referencing `chat_sessions`
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chat_session_id TEXT NOT NULL,
      type TEXT NOT NULL,
      text TEXT,
      image TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
    );
  `);
}

export async function getChats() {
  const db = await getDB();
  const chats = await db.executeSql(
    'SELECT id, title, created_at FROM chat_sessions',
  );
  console.log(chats[0]);
}

export async function getMessages() {
  const db = await getDB();
  const messages = await db.executeSql(
    'SELECT id, type, text, created_at, image FROM messages',
  );
  console.log(messages[0]);
}
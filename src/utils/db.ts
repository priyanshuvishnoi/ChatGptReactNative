import SQLite from 'react-native-sqlite-storage';
import {Chat, Message} from '../@types';
import moment from 'moment';

SQLite.enablePromise(true);

export async function getDB() {
  return await SQLite.openDatabase({
    name: 'chat.db',
    location: 'default',
  });
}

export async function createTable() {
  try {
    const db = await getDB();
    await db.transaction(
      async tx =>
        await tx.executeSql(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`),
    );
    await db.transaction(async tx =>
      tx.executeSql(` CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chat_session_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          text TEXT,
          image TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (chat_session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
        );`),
    );
  } catch (e) {
    console.log(e);
  }
}

export async function getChats() {
  const db = await getDB();

  return new Promise<Chat[]>((resolve, reject) => {
    db.transaction(async tx => {
      tx.executeSql(
        'SELECT id, title, created_at FROM chat_sessions ORDER BY created_at DESC',
        [],
        (tx, results) => {
          const chatsSessions: Chat[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            chatsSessions.push({
              id: results.rows.item(i).id,
              title: results.rows.item(i).title,
              created_at: moment
                .utc(results.rows.item(i).created_at)
                .local()
                .format('LLL'),
            });
          }
          resolve(chatsSessions);
        },
        (tx, error) => {
          reject(error);
        },
      );
    });
  });
}

export async function getMessages(chatId: number) {
  const messageList: Message[] = [];
  try {
    const db = await getDB();
    const messages = await db.executeSql(
      'SELECT id, type, text, created_at, image FROM messages WHERE chat_session_id = ?',
      [chatId],
    );
    for (let i = 0; i < messages[0].rows.length; i++) {
      messageList.push({
        id: messages[0].rows.item(i).id,
        type: messages[0].rows.item(i).type,
        text: messages[0].rows.item(i).text,
        image: messages[0].rows.item(i).image,
        inDb: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
  return messageList;
}

export async function saveChatMessages(
  chatTitle: string,
  messages: Omit<Message, 'id' | 'created_at'>[],
) {
  try {
    const db = await getDB();

    // Step 1: Insert chat into chat_sessions
    let chatId: number;
    await db.transaction(async tx => {
      const res = await tx.executeSql(
        'INSERT INTO chat_sessions (title) VALUES (?)',
        [chatTitle],
      );
      chatId = res[1].insertId; // Retrieve the auto-generated chat ID
    });

    // Step 2: Insert messages into messages
    try {
      for (const message of messages) {
        await db.executeSql(
          'INSERT INTO messages (chat_session_id, type, text, image) VALUES (?, ?, ?, ?)',
          [chatId!, message.type, message.text, message.image ?? null],
        );
      }
      console.log('Messages saved for chat ID:', chatId!);
    } catch (e) {
      console.log('Error inserting messages:', e);
    }

    console.log('Chat and messages saved successfully');
  } catch (e) {
    console.log('Error saving chat or messages:', e);
  }
}

export async function deleteChat(chatId: number) {
  const db = await getDB();
  await db.transaction(async tx => {
    try {
      tx.executeSql('DELETE FROM chat_sessions WHERE id = ?', [chatId]);
      tx.executeSql('DELETE FROM messages WHERE chat_session_id = ?', [chatId]);
    } catch (e) {
      console.log(e);
    }
    // tx.executeSql('DELETE FROM messages');
    // tx.executeSql('DELETE FROM chat_sessions');
  });
}

export async function updateChat(chatId: number, messages: Message[]) {
  // insert only new messages which are not already in the database
  const db = await getDB();
  const newMessages = messages.filter(message => !message.inDb);
  if (newMessages.length === 0) {
    return;
  }
  const promises = newMessages.map(messages =>
    db.executeSql(
      `
      INSERT INTO messages (chat_session_id, type, text, image)
      VALUES (?, ?, ?, ?)
    `,
      [chatId, messages.type, messages.text, messages.image ?? null],
    ),
  );
  try {
    await Promise.all(promises);
  } catch (e) {
    console.log(e);
  }
}

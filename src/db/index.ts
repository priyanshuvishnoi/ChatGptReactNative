import { DataSource } from 'typeorm'
import { ChatEntity } from './entity/Chat';
import { MessageEntity } from './entity/Message';

const dataSource = new DataSource({
    type: 'react-native',
    database: 'chat.db',
    location: 'default',
    logging: 'all',
    entities: [
        ChatEntity, MessageEntity
    ],
})

export async function initDB() {
    try {
        dataSource.setOptions({
            loggerLevel: 'info'
        })
        if (dataSource.isInitialized) return;
        await dataSource.initialize()
        // await dataSource.synchronize(true)
    } catch (e) {
        console.log(e)
    }
}

export const getDB = async () => {
    await initDB()
    return dataSource;
}
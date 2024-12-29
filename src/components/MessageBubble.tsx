import { View, Text, Alert, Image, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import Markdown from 'react-native-markdown-display';
import { styles } from '../ChatScreen/styles';
import Clipboard from '@react-native-clipboard/clipboard';
import type { Message } from '../@types';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { MessageEntity } from '../db/entity/Message';

type Props = { item: MessageEntity }

export default function MessageBubble({ item }: Props) {
    const isUser = item?.type === 'user';
    const theme = useSelector((state: RootState) => state?.theme?.value);

    return (
        <TouchableOpacity
            onLongPress={() => {
                Clipboard.setString(item?.text);
                Alert.alert('Copied to clipboard');
            }}>
            <View
                style={[
                    styles.messageContainer,
                    isUser ? styles.userMessage : styles.botMessage,
                ]}>
                {isUser ? (
                    <View>
                        {item?.images?.length ? (
                            <FlatList
                                data={item.images}
                                keyExtractor={item => item}
                                renderItem={({ item, index }) => (
                                    <Image
                                        source={{ uri: `data:image/jpeg;base64,${item}` }}
                                        style={styles.image}
                                    />
                                )}
                                numColumns={2}
                            />


                        ) : null}
                        <Text style={styles.messageText}>{item?.text}</Text>
                    </View>
                ) : (
                    <View style={styles.markdownContainer}>
                        <Markdown
                            style={{
                                ...styles.markdown,
                                body: { color: theme.colors.text },
                            }}
                        >
                            {item?.text ?? ''}
                        </Markdown>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}
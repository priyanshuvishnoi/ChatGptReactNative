import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import { Alert, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useSelector } from 'react-redux';
import { styles } from '../ChatScreen/styles';
import { MessageEntity } from '../db/entity/Message';
import { RootState } from '../redux/store';

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
                                    <View
                                        style={styles.imageContainer}
                                    >
                                        <Image
                                            source={{ uri: `data:image/jpeg;base64,${item}` }}
                                            style={styles.image}
                                            resizeMode="cover"
                                        />
                                    </View>
                                )}
                                numColumns={3}
                                contentContainerStyle={{ gap: 5 }}
                                columnWrapperStyle={{ gap: 5 }}
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
import {useNavigation} from '@react-navigation/core';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {Alert, FlatList, PanResponder, Text, View} from 'react-native';
import {Appbar, Icon, PaperProvider, useTheme, List} from 'react-native-paper';
import {Chat, RootStackParamList} from '../@types';
import * as DB from '../utils/db';
import {styles} from './styles';

export default function HistoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', getChats);

    return unsubscribe;
  }, []);

  const getChats = async () => {
    await DB.createTable();
    setChats(await DB.getChats());
  };

  const deleteChat = async (chatId: number) => {
    Alert.alert('Delete chat', 'Are you sure you want to delete this chat?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          await DB.deleteChat(chatId);
          getChats();
        },
        style: 'destructive',
      },
    ]);
  };

  const loadChat = async (chatId: number) => {
    navigation.push('chat', {id: chatId});
  };

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header theme={theme}>
        <Appbar.Content title="History" />
        <Appbar.Action
          icon="plus"
          onPress={() => {
            // DB.createTable();
            navigation.push('chat');
          }}
        />
      </Appbar.Header>
      <View style={styles.container}>
        {chats?.length ? (
          <FlatList
            data={chats}
            keyExtractor={item => `${item?.id}`}
            renderItem={element => (
              // <View style={styles.chatItem}>
              //   <View style={styles.chatItemDetails}>
              //     <Text style={styles.chatItemText}>{element.item.title}</Text>
              //     <Text style={styles.chatItemDate}>
              //       {element.item.created_at}
              //     </Text>
              //   </View>
              //   <View>
              //     <Icon source="chevron-right" size={30} color="#666666" />
              //   </View>
              // </View>
              <List.Item
                title={element.item.title}
                titleStyle={styles.chatItemText}
                description={element.item.created_at}
                descriptionStyle={styles.chatItemDate}
                style={styles.chatItem}
                onLongPress={() => deleteChat(element.item.id)}
                onPress={() => loadChat(element.item.id)}
                right={() => (
                  <View style={styles.chatRightIcon}>
                    <Icon source="chevron-right" size={30} color="#666666" />
                  </View>
                )}
              />
            )}
          />
        ) : (
          <></>
        )}
      </View>
    </PaperProvider>
  );
}

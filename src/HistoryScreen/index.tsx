import { useNavigation } from '@react-navigation/core';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { Appbar, Icon, List, PaperProvider, FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import type { RootStackParamList } from '../@types';
import { deleteChatFromDB, loadChatsFromDB } from '../redux/slices/chatSlice';
import { toggleTheme } from '../redux/slices/themeSlice';
import { AppDispatch, RootState } from '../redux/store';
import { styles } from './styles';
import LineIcon from 'react-native-vector-icons/SimpleLineIcons';
import { setDialogOpen } from '../redux/slices/commonSlice';


export default function HistoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const chats = useSelector((state: RootState) => state?.chat?.value);
  const theme = useSelector((state: RootState) => state?.theme?.value);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', getChats);
    getChats();
    return unsubscribe;
  }, []);

  const getChats = async () => {
    dispatch(loadChatsFromDB());
  };

  const deleteChat = async (chatId: number) => {
    Alert.alert('Delete chat', 'Are you sure you want to delete this chat?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: () => {
          dispatch(deleteChatFromDB(chatId));
        },
        style: 'destructive',
      },
    ]);
  };

  const loadChat = async (chatId: number) => {
    navigation.push('chat', { id: chatId });
  };

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header theme={theme} >
        <Appbar.Action
          icon="theme-light-dark"
          onPress={() => dispatch(toggleTheme())}
        />

        <Appbar.Content title="History" style={{ marginInline: 0 }} />
        <Appbar.Action
          icon={LineIcon.getImageSourceSync('settings')}
          onPress={() => dispatch(setDialogOpen(true))}
        />

        {/* <Appbar.Action
          icon="plus"
          onPress={() => {
            // DB.createTable();
            navigation.push('chat');
          }}
        /> */}
      </Appbar.Header>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {chats?.length ? (
          <FlatList
            data={chats}
            keyExtractor={item => `${item?.id}`}
            renderItem={element => (
              <List.Item
                title={element.item.title}
                titleStyle={[styles.chatItemText, { color: theme.colors.text }]}
                description={element.item.createdAt}
                descriptionStyle={[
                  styles.chatItemDate,
                  { color: theme.colors.text },
                ]}
                style={[
                  styles.chatItem,
                  { backgroundColor: theme.colors.surface },
                ]}
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
        ) : null}
        <FAB
          icon="plus"
          label='New Chat'
          style={[styles.FAB, {
            backgroundColor: theme.colors.inverseOnSurface,
            color: theme.colors.text,
          }]}
          onPress={() => {
            navigation.push('chat');
          }} />
      </View>
    </PaperProvider>
  );
}

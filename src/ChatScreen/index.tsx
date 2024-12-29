import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Appbar,
  IconButton,
  Provider as PaperProvider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import type { Message, RootStackParamList } from '../@types';
import ImageList from '../components/ImageList';
import { ImagePickerModal } from '../components/ImagePickerModal';
import MessageBubble from '../components/MessageBubble';
import SaveChatDialog from '../components/SaveChatDialog';
import TypingIndicator from '../components/TypingIndicator';
import { saveChatToDB, updateChat } from '../redux/slices/chatSlice';
import {
  clearChat,
  loadMessagesFromDB,
  sendMessage,
} from '../redux/slices/messageSlice';
import { toggleTheme } from '../redux/slices/themeSlice';
import { AppDispatch, RootState } from '../redux/store';
import { styles } from './styles';

export default function ChatScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'chat'>>();

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [chatTitle, setChatTitle] = useState('');
  const [saveDialogVisible, setSaveDialogVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const listRef = useRef<FlatList>(null);
  const inputContainerRef = useRef<View>(null);
  const inputRef = useRef<TextInput>(null);

  const theme = useSelector((state: RootState) => state?.theme?.value);
  const messages = useSelector((state: RootState) => state?.message?.value);

  const dispatch = useDispatch<AppDispatch>();

  const initDb = async () => {
    const chatId = route.params?.id;

    await dispatch(loadMessagesFromDB(chatId));

    setTimeout(() => {
      listRef?.current?.scrollToEnd({ animated: false });
    }, 0);
  };

  useEffect(() => {
    initDb();
  }, []);

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText,
      images: imageUrls,
    };
    setInputText('');
    setImageUrls([]);
    setTimeout(() => {
      listRef.current?.scrollToEnd();
      inputRef.current?.blur();
    }, 0);

    try {
      setIsLoading(true);
      await dispatch(sendMessage(newMessage));
      setTimeout(() => {
        listRef.current?.scrollToEnd();
      }, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert('Clear chat', 'Are you sure you want to clear this chat?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Clear',
        onPress: () => {
          dispatch(clearChat());
          setInputText('');
          setImageUrls([]);
        },
        style: 'destructive',
      },
    ]);
  };

  const saveChat = async () => {
    if (!chatTitle.trim()) {
      Alert.alert('Error', 'Please enter a chat title');
      return;
    }

    try {
      dispatch(saveChatToDB({ title: chatTitle, messages }));
      Alert.alert('Success', 'Chat saved successfully!');
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setSaveDialogVisible(false);
      setChatTitle('');
    }
  };

  return (
    <PaperProvider theme={theme}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* App Header */}
        <Appbar.Header theme={theme}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Action
            icon="theme-light-dark"
            onPress={() => dispatch(toggleTheme())}
          />
          <Appbar.Content title="ChatGPT" />
          <Appbar.Action
            icon="content-save-outline"
            onPress={() => {
              if (route.params?.id) {
                dispatch(updateChat({ chatId: route.params.id, messages }));
                Alert.alert('Success', 'Chat updated successfully!');
                return;
              }

              setSaveDialogVisible(true);
            }}
          />
          <Appbar.Action
            icon="delete-outline"
            onPress={handleClearChat}
            color="red"
          />
        </Appbar.Header>

        {/* Chat Area */}
        <FlatList
          data={messages.filter(m => m.type !== 'system')}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble item={item} />}
          contentContainerStyle={[
            styles.chatArea,
            { backgroundColor: theme.colors.background },
          ]}
          ref={listRef}
        />
        {isLoading && <TypingIndicator />}

        {imageUrls?.length ? (
          <ImageList images={imageUrls} setImageUrls={setImageUrls} />
        ) : null}
        {/* Input Field */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: theme.colors.surface },
          ]}
          ref={inputContainerRef}>
          <IconButton
            icon="camera"
            size={24}
            onPress={() => {
              if (imageUrls.length >= 3) {
                Alert.alert('You can only upload 3 images at a time!');
                return;
              }
              setImageModalVisible(true);
            }}
            style={styles.cameraIcon}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.text}
            value={inputText}
            onChangeText={setInputText}
            ref={inputRef}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        <ImagePickerModal
          imageModalVisible={imageModalVisible}
          setImageModalVisible={setImageModalVisible}
          setImageUrls={setImageUrls}
        />
        <SaveChatDialog
          saveDialogVisible={saveDialogVisible}
          setSaveDialogVisible={setSaveDialogVisible}
          chatTitle={chatTitle}
          setChatTitle={setChatTitle}
          saveChat={saveChat}
          theme={theme}
        />
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

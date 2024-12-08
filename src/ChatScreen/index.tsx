import Clipboard from '@react-native-clipboard/clipboard';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Markdown from 'react-native-markdown-display';
import {
  Appbar,
  IconButton,
  Provider as PaperProvider,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {Message, RootStackParamList} from '../@types';
import {ImagePickerModal} from '../components/ImagePickerModal';
import SaveChatDialog from '../components/SaveChatDialog';
import TypingIndicator from '../components/TypingIndicator';
import {saveChatToDB, updateChat} from '../redux/slices/chatSlice';
import {
  clearChat,
  loadMessagesFromDB,
  sendMessage,
} from '../redux/slices/messageSlice';
import {toggleTheme} from '../redux/slices/themeSlice';
import {AppDispatch, RootState} from '../redux/store';
import {styles} from './styles';

export default function ChatScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'chat'>>();

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [base64String, setBase64String] = useState<string | null>(null);
  const [saveDialogVisible, setSaveDialogVisible] = useState(false);
  const [chatTitle, setChatTitle] = useState('');

  const listRef = useRef<FlatList>(null);
  const inputContainerRef = useRef<View>(null);
  const inputRef = useRef<TextInput>(null);

  const theme = useSelector((state: RootState) => state?.theme?.value);
  const messages = useSelector((state: RootState) => state?.message?.value);

  const dispatch = useDispatch<AppDispatch>();

  const initDb = async () => {
    // Create `chat_sessions` table
    const chatId = route.params?.id;

    await dispatch(loadMessagesFromDB(chatId));

    setTimeout(() => {
      listRef?.current?.scrollToEnd({animated: false});
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
      image: base64String,
    };
    setInputText('');
    setBase64String(null);
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
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({item}: {item: Message}) => {
    const isUser = item?.type === 'user';
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
              {item?.image && (
                <Image
                  source={{uri: `data:image/jpeg;base64,${item.image}`}}
                  style={{width: 200, height: 150}}
                />
              )}
              <Text style={styles.messageText}>{item?.text}</Text>
            </View>
          ) : (
            <View style={styles.markdownContainer}>
              <Markdown
                style={{
                  ...styles.markdown,
                  body: {color: theme.colors.text},
                }}>
                {item?.text}
              </Markdown>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleCamera = () => {
    setBase64String(null);
    try {
      launchCamera(
        {
          mediaType: 'photo',
          quality: 1,
          includeBase64: true,
        },
        response => {
          setImageModalVisible(false);
          if (response.didCancel) {
            console.log('User cancelled camera');
          } else if (response.errorCode) {
            console.error('Camera error:', response.errorMessage);
          } else {
            if (response && response.assets && response.assets.length > 0) {
              setBase64String(response.assets[0].base64!);
              inputRef.current?.focus();
            }
          }
        },
      );
    } catch (e) {
      console.log(e);
    }
  };

  const handleGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
        includeBase64: true,
      },
      response => {
        setImageModalVisible(false);
        if (response.didCancel) {
          console.log('User cancelled gallery');
        } else if (response.errorCode) {
          console.error('Gallery error:', response.errorMessage);
        } else {
          if (response && response.assets && response.assets.length > 0) {
            setBase64String(response.assets[0].base64!);
            inputRef.current?.focus();
          }
        }
      },
    );
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
          setBase64String(null);
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
      dispatch(saveChatToDB({title: chatTitle, messages}));
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
        style={[styles.container, {backgroundColor: theme.colors.background}]}
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
                dispatch(updateChat({chatId: route.params.id, messages}));
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
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.chatArea,
            {backgroundColor: theme.colors.background},
          ]}
          ref={listRef}
        />
        {isLoading && <TypingIndicator />}

        {/* Input Field */}
        <View
          style={[
            styles.inputContainer,
            {backgroundColor: theme.colors.surface},
          ]}
          ref={inputContainerRef}>
          {!base64String ? (
            <IconButton
              icon="camera"
              size={24}
              onPress={() => {
                setBase64String(null);
                setImageModalVisible(true);
              }}
              style={styles.cameraIcon}
            />
          ) : (
            <View style={[styles.cameraIcon, {paddingInline: 10}]}>
              <TouchableOpacity
                onPress={() => {
                  setBase64String(null);
                  setImageModalVisible(true);
                }}>
                <Image
                  source={{uri: `data:image/jpeg;base64,${base64String}`}}
                  style={{width: 30, height: 30}}
                />
              </TouchableOpacity>
            </View>
          )}
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
            style={[styles.sendButton, {backgroundColor: theme.colors.primary}]}
            onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        <ImagePickerModal
          imageModalVisible={imageModalVisible}
          setImageModalVisible={setImageModalVisible}
          handleCamera={handleCamera}
          handleGallery={handleGallery}
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

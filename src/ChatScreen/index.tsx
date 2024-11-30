import Clipboard from '@react-native-clipboard/clipboard';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Appearance,
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
  DefaultTheme,
  IconButton,
  MD3DarkTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {Chat, ChatGPTResponse, Message} from '../@types';
import {ImagePickerModal} from '../components/ImagePickerModal';
import SaveChatDialog from '../components/SaveChatDialog';
import TypingIndicator from '../components/TypingIndicator';
import client from '../utils/client';
import * as DB from '../utils/db';
import {styles} from './styles';
import {useNavigation, useRoute} from '@react-navigation/native';

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0066cc',
    background: '#ffffff',
    text: '#000000',
    surface: '#f5f5f5',
  },
};

const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#1e90ff',
    background: '#121212',
    text: '#ffffff',
    surface: '#1e1e1e',
  },
};

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      text: 'send messages in markdown format',
      image: '',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [base64String, setBase64String] = useState<string | null>(null);
  const [saveDialogVisible, setSaveDialogVisible] = useState(false);
  const [chatTitle, setChatTitle] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);

  const listRef = useRef<FlatList>(null);
  const inputContainerRef = useRef<View>(null);
  const inputRef = useRef<TextInput>(null);

  const [theme, setTheme] = useState(
    Appearance.getColorScheme() === 'dark' ? DarkTheme : LightTheme,
  );

  const initDb = async () => {
    // Create `chat_sessions` table
    await DB.getChats();
    await DB.getMessages();
  };

  useEffect(() => {
    const listener = Appearance.addChangeListener(({colorScheme}) => {
      setTheme(colorScheme === 'dark' ? DarkTheme : LightTheme);
    });
    return () => listener.remove();
  }, []);

  useEffect(() => {
    initDb();
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === LightTheme ? DarkTheme : LightTheme));
  };

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText,
      image: base64String,
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');
    listRef.current?.scrollToEnd();

    const messagesToSend: any[] = messages.map(m => ({
      role: m.type,
      content: m.text,
    }));

    if (base64String) {
      messagesToSend.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: inputText,
          },
          base64String && {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64String}`,
            },
          },
        ],
      });
    } else {
      messagesToSend.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: inputText,
          },
        ],
      });
    }

    try {
      setIsLoading(true);
      const res = await client.post<ChatGPTResponse>('', {
        model: 'gpt-4o-mini',
        messages: messagesToSend,
        temperature: 0.7,
      });
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          type: 'assistant',
          text: res.data.choices[0].message.content,
        },
      ]);
      listRef.current?.scrollToEnd();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
      setBase64String(null);
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

  const clearChat = () => {
    setMessages(prevMessages =>
      prevMessages.filter(message => message.type === 'system'),
    );
    setBase64String(null);
  };

  const saveChat = async () => {
    if (!chatTitle.trim()) {
      Alert.alert('Error', 'Please enter a chat title');
      return;
    }

    const db = await DB.getDB();
    const chatSessionId = Date.now().toString();

    await db.executeSql(
      'INSERT INTO chat_sessions (id, title, created_at) VALUES (?, ?, ?)',
      [chatSessionId, chatTitle, new Date().toISOString()],
    );
    const filteredMessages = messages.filter(m => m.type !== 'system');
    const promises = [];
    for (const message of filteredMessages) {
      promises.push(
        db.executeSql(
          'INSERT INTO messages (id, type, text, created_at, image) VALUES (?, ?, ?, ?, ?)',
          [
            message.id,
            message.type,
            message.text,
            new Date().toISOString(),
            message.image ?? '',
          ],
        ),
      );
    }
    await Promise.all(promises);

    // db.transaction(tx => {
    //   tx.executeSql(
    //     'INSERT INTO chat_sessions (id, title, created_at) VALUES (?, ?, ?)',
    //     [chatSessionId, chatTitle, new Date().toISOString()],
    //   )
    //     .then(d => console.log(d))
    //     .catch(e => console.log(e));

    //   const filteredMessages = messages.filter(m => m.type !== 'system');

    //   for (const message of filteredMessages) {
    //     tx.executeSql(
    //       'INSERT INTO messages (id, type, text, created_at, image) VALUES (?, ?, ?, ?, ?)',
    //       [
    //         message.id,
    //         message.type,
    //         message.text,
    //         new Date().toISOString(),
    //         message.image,
    //       ],
    //     )
    //       .then(d => console.log(d))
    //       .catch(e => console.log(e));
    //   }
    //   DB.getChats();
    //   DB.getMessages();
    // });
    Alert.alert('Success', 'Chat saved successfully!');
    setSaveDialogVisible(false);
    setChatTitle('');
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
        <SafeAreaProvider>
          <KeyboardAvoidingView
            style={[
              styles.container,
              {backgroundColor: theme.colors.background},
            ]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
            {/* App Header */}
            <Appbar.Header theme={theme}>
              <Appbar.BackAction onPress={() => navigation.goBack()} />
              <Appbar.Action icon="theme-light-dark" onPress={toggleTheme} />
              <Appbar.Content title="ChatGPT" />
              <Appbar.Action
                icon="content-save-outline"
                onPress={() => setSaveDialogVisible(true)}
              />
              <Appbar.Action
                icon="delete-outline"
                onPress={clearChat}
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
                style={[
                  styles.sendButton,
                  {backgroundColor: theme.colors.primary},
                ]}
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
        </SafeAreaProvider>
      </SafeAreaView>
    </PaperProvider>
  );
}

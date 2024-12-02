import Clipboard from '@react-native-clipboard/clipboard';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
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
import {ChatGPTResponse, Message, RootStackParamList} from '../@types';
import {ImagePickerModal} from '../components/ImagePickerModal';
import SaveChatDialog from '../components/SaveChatDialog';
import TypingIndicator from '../components/TypingIndicator';
import client from '../utils/client';
import * as DB from '../utils/db';
import {styles} from './styles';

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
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'chat'>>();

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

  const listRef = useRef<FlatList>(null);
  const inputContainerRef = useRef<View>(null);
  const inputRef = useRef<TextInput>(null);

  const [theme, setTheme] = useState(
    Appearance.getColorScheme() === 'dark' ? DarkTheme : LightTheme,
  );

  const initDb = async () => {
    // Create `chat_sessions` table
    const chatId = route.params?.id;
    if (!chatId) return;
    const messages = await DB.getMessages(chatId);
    setMessages(messages);
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

    const messagesToSend: any[] = messages.map(m => {
      if (m.image) {
        return {
          role: m.type,
          content: [
            {
              type: 'text',
              text: m.text,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${m.image}`,
              },
            },
          ],
        };
      } else {
        return {
          role: m.type,
          content: [
            {
              type: 'text',
              text: m.text,
            },
          ],
        };
      }
    });

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
    Alert.alert('Clear chat', 'Are you sure you want to clear this chat?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Clear',
        onPress: () => {
          setMessages(prevMessages =>
            prevMessages.filter(message => message.type === 'system'),
          );
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
      await DB.saveChatMessages(chatTitle, messages);
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
          <Appbar.Action icon="theme-light-dark" onPress={toggleTheme} />
          <Appbar.Content title="ChatGPT" />
          <Appbar.Action
            icon="content-save-outline"
            onPress={() => {
              if (route.params?.id) {
                DB.updateChat(route.params.id, messages).then(() =>
                  Alert.alert('Success', 'Chat updated successfully!'),
                );
                return;
              }

              setSaveDialogVisible(true);
            }}
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

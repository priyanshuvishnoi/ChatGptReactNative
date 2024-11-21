import Clipboard from '@react-native-clipboard/clipboard';
import React, {useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import Markdown from 'react-native-markdown-display';
import {Appbar, IconButton} from 'react-native-paper';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {ChatGPTResponse} from './src/@types';
import TypingIndicator from './src/components/TypingIndicator';
import client from './src/utils/client';
import RNFS from 'react-native-fs';

export default function App() {
  const [messages, setMessages] = useState([
    {id: '1', type: 'system', text: 'send messages in markdown format'},
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [base64String, setBase64String] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText,
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');
    listRef.current?.scrollToEnd();

    try {
      setIsLoading(true);
      const res = await client.post<ChatGPTResponse>('', {
        model: 'gpt-4o-mini',
        messages: [
          ...messages.map(m => ({
            role: m.type,
            content: m.text,
          })),
          {
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
          },
        ],
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

  const renderMessage = ({item}: any) => {
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
            <Text style={styles.messageText}>{item?.text}</Text>
          ) : (
            <View style={styles.markdownContainer}>
              <Markdown style={styles.markdown}>{item?.text}</Markdown>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleCamera = () => {
    setImageModalVisible(false);
    launchCamera(
      {
        mediaType: 'photo',
        quality: 1,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.error('Camera error:', response.errorMessage);
        } else {
          if (response && response.assets && response.assets.length > 0) {
            handleImage(response!.assets![0]);
          }
        }
      },
    );
  };

  const handleGallery = () => {
    setImageModalVisible(false);
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled gallery');
        } else if (response.errorCode) {
          console.error('Gallery error:', response.errorMessage);
        } else {
          handleImage(response!.assets![0]);
        }
      },
    );
  };

  const handleImage = async (image: Asset) => {
    try {
      const base64 = await RNFS.readFile(image.uri!, 'base64');
      setBase64String(base64);
    } catch (error) {
      setBase64String(null);
    }
  };

  const clearChat = () => {
    setMessages(prevMessages =>
      prevMessages.filter(message => message.type === 'system'),
    );
    setBase64String(null);
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <SafeAreaProvider>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* App Header */}
          <Appbar.Header>
            <Appbar.Content title="ChatGPT" />
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
            contentContainerStyle={styles.chatArea}
            ref={listRef}
          />
          {isLoading && <TypingIndicator />}

          {/* Input Field */}
          <View style={styles.inputContainer}>
            <IconButton
              icon="camera"
              size={24}
              onPress={() => {
                setBase64String(null);
                setImageModalVisible(true);
              }}
              style={styles.cameraIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>

          <Modal
            animationType="slide"
            transparent
            visible={imageModalVisible}
            onRequestClose={() => setImageModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleCamera}>
                  <Text style={styles.modalButtonText}>Open Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleGallery}>
                  <Text style={styles.modalButtonText}>
                    Select from Gallery
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setImageModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatArea: {
    padding: 10,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0066cc',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#eaeaea',
  },
  messageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  cameraIcon: {
    marginHorizontal: 5,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  modalButtonText: {
    textAlign: 'center',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  markdownContainer: {
    maxWidth: '100%',
    flexShrink: 1,
  },
  markdown: {
    body: {
      color: '#333',
    },
  } as any,
});

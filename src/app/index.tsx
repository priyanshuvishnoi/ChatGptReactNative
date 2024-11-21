import { ChatGPTResponse } from '@/@types';
import client from '@/utils/client';
import React, { useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Appbar } from 'react-native-paper';
// @ts-ignore
import Markdown from 'react-native-markdown-display';
import TypingIndicator from '@/components/TypingIndicator';
import Clipboard from '@react-native-clipboard/clipboard';

export default function ChatGptScreen() {
  const [messages, setMessages] = useState([
    { id: '1', type: 'system', text: 'send messages in markdown format' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
            content: inputText,
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
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: any) => {
    const isUser = item?.type === 'user';
    return (
      <TouchableOpacity
        onLongPress={() => {
          Clipboard.setString(item?.text);
          Alert.alert('Copied to clipboard');
        }}
      >
        <View
          style={[
            styles.messageContainer,
            isUser ? styles.userMessage : styles.botMessage,
          ]}
        >
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* App Header */}
      <Appbar.Header>
        <Appbar.Content title="ChatGPT" />
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
    </KeyboardAvoidingView>
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
    // backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
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
    marginBottom: 12,
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

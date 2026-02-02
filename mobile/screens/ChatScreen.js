import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image
} from 'react-native';
import io from 'react-native-socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function ChatScreen({ route }) {
  const { chatId, chatName, otherUserId } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatId]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${global.authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Load messages error:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить сообщения');
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = () => {
    socketRef.current = io(API_URL, {
      auth: {
        token: global.authToken
      },
      transports: ['websocket']
    });

    socketRef.current.emit('join-chat', chatId);

    socketRef.current.on('new-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socketRef.current.on('message-deleted', (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageId)
      );
    });
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    setSending(true);
    const text = messageText.trim();
    setMessageText('');

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${global.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId,
          text,
          type: 'text'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
      setMessageText(text);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.sender_id === global.userId;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.senderName}>{item.sender_name}</Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble
          ]}
        >
          {item.type === 'text' && (
            <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
              {item.text}
            </Text>
          )}
          {item.type === 'image' && (
            <Image
              source={{ uri: `${API_URL}${item.image_url}` }}
              style={styles.messageImage}
            />
          )}
        </View>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Нет сообщений</Text>
            <Text style={styles.emptySubtext}>Начните разговор!</Text>
          </View>
        }
      />

      {/* Ввод сообщения */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="Напишите сообщение..."
          placeholderTextColor="#64748b"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!messageText.trim() || sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? '...' : '→'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ===== Стили =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 16
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'column'
  },
  ownMessageContainer: {
    alignItems: 'flex-end'
  },
  otherMessageContainer: {
    alignItems: 'flex-start'
  },
  senderName: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
    marginHorizontal: 8
  },
  messageBubble: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '80%'
  },
  ownBubble: {
    backgroundColor: '#3b82f6'
  },
  otherBubble: {
    backgroundColor: '#1e293b'
  },
  messageText: {
    fontSize: 15,
    color: '#1e293b'
  },
  ownMessageText: {
    color: '#fff'
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8
  },
  messageTime: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    marginHorizontal: 8
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
  },
  emptyText: {
    fontSize: 18,
    color: '#cbd5e1',
    fontWeight: '600'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8
  },
  inputSection: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1e293b',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f1f5f9',
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#334155'
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#64748b',
    opacity: 0.5
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  }
});

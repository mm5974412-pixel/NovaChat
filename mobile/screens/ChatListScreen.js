import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function ChatListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [])
  );

  const loadChats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chats`, {
        headers: {
          'Authorization': `Bearer ${global.authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить чаты');
      }
    } catch (error) {
      console.error('Load chats error:', error);
      Alert.alert('Ошибка', `Не удалось подключиться к серверу: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const renderChat = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('Chat', {
          chatId: item.id,
          chatName: item.name,
          otherUserId: item.other_user_id
        })
      }
    >
      <View style={styles.chatAvatar}>
        {item.avatar_url ? (
          <Image
            source={{ uri: `${API_URL}${item.avatar_url}` }}
            style={styles.avatarImage}
          />
        ) : (
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <View style={styles.chatInfo}>
        <Text style={styles.chatName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.chatPreview} numberOfLines={1}>
          {item.last_message || 'Нет сообщений'}
        </Text>
      </View>

      <View style={styles.chatMeta}>
        <Text style={styles.chatTime}>
          {formatTime(new Date(item.last_message_time))}
        </Text>
        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unread_count > 99 ? '99+' : item.unread_count}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {chats.length > 0 ? (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Нет активных чатов</Text>
          <Text style={styles.emptySubtext}>Начните новый разговор</Text>
        </View>
      )}
    </View>
  );
}

// Вспомогательная функция форматирования времени
function formatTime(date) {
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Вчера';
  } else if (days < 7) {
    return `${days}д назад`;
  } else {
    return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
  }
}

// ===== Стили =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    alignItems: 'center'
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%'
  },
  avatarText: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: '600'
  },
  chatInfo: {
    flex: 1
  },
  chatName: {
    fontSize: 16,
    color: '#f1f5f9',
    fontWeight: '600',
    marginBottom: 4
  },
  chatPreview: {
    fontSize: 13,
    color: '#94a3b8'
  },
  chatMeta: {
    alignItems: 'flex-end',
    gap: 6
  },
  chatTime: {
    fontSize: 12,
    color: '#64748b'
  },
  unreadBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center'
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  separator: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 0
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 18,
    color: '#cbd5e1',
    fontWeight: '600'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8
  }
});

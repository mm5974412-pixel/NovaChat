import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    loadUserProfile();
    loadSettings();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${global.authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Load profile error:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const notif = await AsyncStorage.getItem('notifications_enabled');
      const dark = await AsyncStorage.getItem('dark_mode');
      if (notif !== null) setNotifications(notif === 'true');
      if (dark !== null) setDarkMode(dark === 'true');
    } catch (error) {
      console.error('Load settings error:', error);
    }
  };

  const handleNotificationToggle = async (value) => {
    setNotifications(value);
    await AsyncStorage.setItem('notifications_enabled', String(value));
  };

  const handleDarkModeToggle = async (value) => {
    setDarkMode(value);
    await AsyncStorage.setItem('dark_mode', String(value));
  };

  const handleLogout = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены?',
      [
        { text: 'Отмена', onPress: () => {} },
        {
          text: 'Выход',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['auth_token', 'user_id', 'user_data']);
              navigation.reset({
                index: 0,
                routes: [{ name: 'LoginFlow' }]
              });
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось выполнить выход');
            }
          },
          style: 'destructive'
        }
      ]
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Профиль пользователя */}
      {user && (
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            {user.avatar_url ? (
              <Image
                source={{ uri: `${API_URL}${user.avatar_url}` }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarInitial}>
                {user.username.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user.chats_count || 0}</Text>
              <Text style={styles.statLabel}>Чатов</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user.messages_count || 0}</Text>
              <Text style={styles.statLabel}>Сообщений</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {user.online ? 'Online' : 'Offline'}
              </Text>
              <Text style={styles.statLabel}>Статус</Text>
            </View>
          </View>
        </View>
      )}

      {/* Настройки */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Настройки</Text>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Уведомления</Text>
            <Text style={styles.settingDescription}>
              Получать уведомления о новых сообщениях
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#334155', true: '#3b82f6' }}
            thumbColor={notifications ? '#0f172a' : '#64748b'}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Темный режим</Text>
            <Text style={styles.settingDescription}>
              Использовать темную тему
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: '#334155', true: '#3b82f6' }}
            thumbColor={darkMode ? '#0f172a' : '#64748b'}
          />
        </View>
      </View>

      {/* Информация о приложении */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>О приложении</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Версия</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Платформа</Text>
          <Text style={styles.infoValue}>NovaChat Mobile</Text>
        </View>
      </View>

      {/* Кнопка выхода */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Выход из аккаунта</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

// ===== Стили =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%'
  },
  avatarInitial: {
    fontSize: 40,
    color: '#3b82f6',
    fontWeight: '600'
  },
  username: {
    fontSize: 24,
    color: '#f1f5f9',
    fontWeight: '700',
    marginBottom: 4
  },
  email: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16
  },
  stat: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b'
  },
  settingsSection: {
    paddingHorizontal: 12,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 16,
    paddingHorizontal: 8
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    marginBottom: 12
  },
  settingLabel: {
    fontSize: 15,
    color: '#f1f5f9',
    fontWeight: '500'
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4
  },
  infoSection: {
    paddingHorizontal: 12,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  infoLabel: {
    fontSize: 15,
    color: '#cbd5e1'
  },
  infoValue: {
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '500'
  },
  logoutButton: {
    marginHorizontal: 12,
    marginVertical: 20,
    paddingVertical: 14,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    alignItems: 'center'
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  spacer: {
    height: 20
  }
});

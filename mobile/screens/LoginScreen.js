import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // true = login, false = register
  const [username, setUsername] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Успешный логин
        onLogin(data.token, data.userId, data.user);
      } else {
        Alert.alert('Ошибка входа', data.message || 'Неверные учетные данные');
      }
    } catch (error) {
      Alert.alert('Ошибка', `Не удалось подключиться к серверу: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          username
        })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        onLogin(data.token, data.userId, data.user);
      } else {
        Alert.alert('Ошибка регистрации', data.message || 'Не удалось зарегистрировать пользователя');
      }
    } catch (error) {
      Alert.alert('Ошибка', `Не удалось подключиться к серверу: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Логотип и заголовок */}
        <View style={styles.headerSection}>
          <Text style={styles.logo}>✨</Text>
          <Text style={styles.title}>NovaChat</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Вход в аккаунт' : 'Создание аккаунта'}
          </Text>
        </View>

        {/* Форма */}
        <View style={styles.formSection}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Имя пользователя</Text>
              <TextInput
                style={styles.input}
                placeholder="Ваше имя"
                placeholderTextColor="#64748b"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
          </View>

          {/* Кнопка входа/регистрации */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={isLogin ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Переключение между входом и регистрацией */}
          <View style={styles.toggleSection}>
            <Text style={styles.toggleText}>
              {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
                setUsername('');
              }}
              disabled={loading}
            >
              <Text style={styles.toggleLink}>
                {isLogin ? 'Зарегистрируйтесь' : 'Войдите'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Информация о приложении */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            NovaChat v1.0.0 · Мобильное приложение
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ===== Стили =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60
  },
  logo: {
    fontSize: 80,
    marginBottom: 20
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8'
  },
  formSection: {
    marginBottom: 40
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#f1f5f9',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  toggleText: {
    color: '#94a3b8',
    fontSize: 14
  },
  toggleLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  },
  infoSection: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  infoText: {
    color: '#64748b',
    fontSize: 12
  }
});

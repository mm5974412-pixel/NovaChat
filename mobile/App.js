import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  AppState
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'react-native-socket.io-client';

// Импортируем экраны (будут созданы далее)
import LoginScreen from './screens/LoginScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';

// ===== Инициализация =====
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// ===== Главный стек навигации =====
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: styles.tabBar,
        headerStyle: styles.header,
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18
        }
      })}
    >
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          title: 'Чаты',
          tabBarLabel: 'Чаты'
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Профиль',
          tabBarLabel: 'Профиль'
        }}
      />
    </Tab.Navigator>
  );
}

// ===== Главный компонент приложения =====
export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    // Проверяем аутентификацию при загрузке
    checkAuthentication();

    // Подслушиваем состояние приложения (foreground/background)
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userId = await AsyncStorage.getItem('user_id');

      if (token && userId) {
        // Проверяем валидность токена на сервере
        const response = await fetch(`${API_URL}/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
          // Устанавливаем глобальный токен для всех запросов
          global.authToken = token;
          global.userId = userId;
        } else {
          // Токен невалиден, очищаем хранилище
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_id');
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setInitializing(false);
    }
  };

  const handleAppStateChange = (nextAppState) => {
    if (
      appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // Приложение вернулось на передний план
      console.log('App has come to foreground');
      // Переподключаемся к сокету и синхронизируем данные
    } else if (nextAppState.match(/inactive|background/)) {
      // Приложение отправляется в фон
      console.log('App has gone to background');
    }
    setAppState(nextAppState);
  };

  const handleLogin = async (token, userId, userData) => {
    try {
      // Сохраняем данные аутентификации
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_id', userId);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));

      global.authToken = token;
      global.userId = userId;

      setIsAuthenticated(true);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить данные аутентификации');
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_id');
      await AsyncStorage.removeItem('user_data');
      global.authToken = null;
      global.userId = null;
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (initializing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>NovaChat загружается...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppStack />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animationEnabled: true
          }}
        >
          <Stack.Screen
            name="LoginFlow"
            component={() => <LoginScreen onLogin={handleLogin} />}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

// ===== Стили =====
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a'
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 16
  },
  tabBar: {
    backgroundColor: '#1e293b',
    borderTopColor: '#334155',
    borderTopWidth: 1,
    paddingBottom: 5,
    paddingTop: 8,
    height: 70
  },
  header: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
    borderBottomWidth: 1
  }
});

import React, { useState, useEffect } from 'react';
import { StyleSheet, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import DetectScreen from '../screens/DetectScreen';
import QAScreen from '../screens/QAScreen';
import EduScreen from '../screens/EduScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  
  // 💡 模拟本地数据库：保存已注册的用户
  const [registeredUsers, setRegisteredUsers] = useState<{ phone: string, password: string }[]>([]);
  
  const [currentPage, setCurrentPage] = useState('home');
  const [isFrozen, setIsFrozen] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserPhone('');
    setCurrentPage('home');
    setIsFrozen(false);
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        {/* 把数据库和更新函数传给登录页 */}
        <LoginScreen 
          registeredUsers={registeredUsers}
          setRegisteredUsers={setRegisteredUsers}
          onLogin={(phone: React.SetStateAction<string>) => { setUserPhone(phone); setIsLoggedIn(true); }} 
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {currentPage === 'home' && <HomeScreen isFrozen={isFrozen} userPhone={userPhone} onLogout={handleLogout} />}
      {currentPage === 'detect' && <DetectScreen onFreeze={() => setIsFrozen(true)} />}
      {currentPage === 'qa' && <QAScreen />}
      {currentPage === 'edu' && <EduScreen />}
      
      {!isKeyboardVisible && (
        <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
});
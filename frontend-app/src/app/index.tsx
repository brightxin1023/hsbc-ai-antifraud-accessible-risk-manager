import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import LoginScreen from '../screens/LoginScreen'; 
import HomeScreen from '../screens/HomeScreen';
import DetectScreen from '../screens/DetectScreen';
import QAScreen from '../screens/QAScreen';
import EduScreen from '../screens/EduScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [currentPage, setCurrentPage] = useState('home');
  const [isFrozen, setIsFrozen] = useState(false);

  // 核心逻辑：如果没登录，就只显示登录页
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {currentPage === 'home' && <HomeScreen isFrozen={isFrozen} />}
      {currentPage === 'detect' && <DetectScreen onFreeze={() => setIsFrozen(true)} />}
      {currentPage === 'qa' && <QAScreen />}
      {currentPage === 'edu' && <EduScreen />}
      
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
});
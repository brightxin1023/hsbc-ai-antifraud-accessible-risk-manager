import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import BottomNav from '../components/BottomNav';
import HomeScreen from '../screens/HomeScreen';
import DetectScreen from '../screens/DetectScreen';
import QAScreen from '../screens/QAScreen';
import EduScreen from '../screens/EduScreen';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isFrozen, setIsFrozen] = useState(false);

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
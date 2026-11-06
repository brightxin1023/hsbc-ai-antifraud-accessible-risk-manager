import React, { useState, useEffect } from 'react';
import { StyleSheet, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import TransferScreen from '../screens/TransferScreen';
import QAScreen from '../screens/QAScreen';
import EduScreen from '../screens/EduScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [isFrozen, setIsFrozen] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // 🚀 全局流水账本
  const [transactions, setTransactions] = useState<any[]>([
    { id: 1, title: '转账 - 某某科技有限公司', time: '今天 10:24', amount: '- ¥ 8,000.00', isExpense: true, isAbnormal: isFrozen },
    { id: 2, title: '游戏充值 - 某某游戏平台', time: '今天 09:15', amount: '- ¥ 328.00', isExpense: true, isAbnormal: true },
    { id: 3, title: '收款 - 工资入账', time: '昨天 15:30', amount: '+ ¥ 12,500.00', isExpense: false, isAbnormal: false },
    { id: 4, title: '外卖 - 某某餐饮', time: '昨天 12:10', amount: '- ¥ 35.50', isExpense: true, isAbnormal: false },
  ]);

  // 🚀 新增一笔流水记录
  const addTransaction = (newTx: any) => {
    setTransactions((prev) => [newTx, ...prev]); // 插到最前面
  };

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
        <LoginScreen onLogin={(phone: string) => { setUserPhone(phone); setIsLoggedIn(true); }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {currentPage === 'home' && <HomeScreen isFrozen={isFrozen} userPhone={userPhone} onLogout={handleLogout} transactions={transactions} />}
      {currentPage === 'transfer' && <TransferScreen onFreeze={() => setIsFrozen(true)} addTransaction={addTransaction} />}
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
import React, { useState, useEffect } from 'react';
import { StyleSheet, Keyboard, View } from 'react-native'; // 新增引入了 View
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import TransferScreen from '../screens/TransferScreen';
import QAScreen from '../screens/QAScreen';
import EduScreen from '../screens/EduScreen';
import ScriptDetectScreen from '../screens/ScriptDetectScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [isFrozen, setIsFrozen] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // 全局流水账本
  const [transactions, setTransactions] = useState<any[]>([
    { id: 1, title: '转账 - 某某科技有限公司', time: '今天 10:24', amount: '- ¥ 8,000.00', isExpense: true, isAbnormal: false },
    { id: 2, title: '游戏充值 - 某某游戏平台', time: '今天 09:15', amount: '- ¥ 328.00', isExpense: true, isAbnormal: true },
    { id: 3, title: '收款 - 工资入账', time: '昨天 15:30', amount: '+ ¥ 12,500.00', isExpense: false, isAbnormal: false },
    { id: 4, title: '外卖 - 某某餐饮', time: '昨天 12:10', amount: '- ¥ 35.50', isExpense: true, isAbnormal: false },
  ]);

  // 新增一笔流水记录
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
      {/* 页面内容区域，占据全部空间 */}
      <View style={{ flex: 1 }}>
        {currentPage === 'home' && (
          <HomeScreen 
            isFrozen={isFrozen} 
            userPhone={userPhone} 
            onLogout={handleLogout} 
            transactions={transactions} 
            onUnfreeze={() => setIsFrozen(false)} 
          />
        )}
        
        {currentPage === 'transfer' && (
          <TransferScreen 
            onFreeze={() => setIsFrozen(true)} 
            onUnfreeze={() => setIsFrozen(false)} 
            addTransaction={addTransaction} 
          />
        )}
        
        {currentPage === 'qa' && <QAScreen />}
        {currentPage === 'edu' && <EduScreen />}
        {currentPage === 'script' && <ScriptDetectScreen />}
      </View>
      
      {/* 核心修改：给底部导航栏加上绝对定位，隐藏时不再影响页面高度，彻底解决抖动 */}
      {!isKeyboardVisible && (
        <View style={styles.bottomNavContainer}>
          <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  bottomNavContainer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: 'white' // 保证背景色遮住后面的内容
  }
});
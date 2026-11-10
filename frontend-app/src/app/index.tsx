import React, { useState, useEffect } from 'react';
import { StyleSheet, Keyboard, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import TransferScreen from '../screens/TransferScreen';
import EduListScreen from '../screens/EduListScreen';
import EduDetailScreen from '../screens/EduDetailScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import ToolsScreen from '../screens/ToolsScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [isFrozen, setIsFrozen] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // 新增：用于控制科普详情页的状态
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  // 新增：控制“全部交易流水”二级页面
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const [transactions, setTransactions] = useState<any[]>([
    { id: 1, title: '转账 - 某某科技有限公司', time: '11-10 7:24', amount: '- ¥ 8,000.00', isExpense: true, isAbnormal: false },
    { id: 2, title: '游戏充值 - 某某游戏平台', time: '11-9 09:15', amount: '- ¥ 328.00', isExpense: true, isAbnormal: true },
    { id: 3, title: '收款 - 工资入账', time: '11-08 15:30', amount: '+ ¥ 12,500.00', isExpense: false, isAbnormal: false },
    { id: 4, title: '外卖 - 某某餐饮', time: '11-07 12:10', amount: '- ¥ 35.50', isExpense: true, isAbnormal: false },
  ]);

  const addTransaction = (newTx: any) => {
    setTransactions((prev) => [newTx, ...prev]);
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
      <View style={{ flex: 1 }}>
        {/* 优先显示全部交易流水二级页面，其次科普详情页，最后是底部 Tab 页面 */}
        {showAllTransactions ? (
          <TransactionHistoryScreen transactions={transactions} onBack={() => setShowAllTransactions(false)} />
        ) : selectedArticle ? (
          <EduDetailScreen articleId={selectedArticle.id} onBack={() => setSelectedArticle(null)} />
        ) : (
          <>
            {currentPage === 'home' && (
              <HomeScreen 
                isFrozen={isFrozen} userPhone={userPhone} onLogout={handleLogout} 
                transactions={transactions} onUnfreeze={() => setIsFrozen(false)} 
                onViewAllTransactions={() => setShowAllTransactions(true)}
              />
            )}
            
            {currentPage === 'transfer' && (
              <TransferScreen 
                onFreeze={() => setIsFrozen(true)} onUnfreeze={() => setIsFrozen(false)} 
                addTransaction={addTransaction} userPhone={userPhone} isFrozen={isFrozen}
              />
            )}
            
            {currentPage === 'tools' && <ToolsScreen />}
            {currentPage === 'edu' && <EduListScreen onSelectArticle={(article) => setSelectedArticle(article)} />}
            {currentPage === 'profile' && (
              <MyProfileScreen userPhone={userPhone} onLogout={handleLogout} />
            )}
          </>
        )}
      </View>
      
      {/* 只有在未进入详情页/全部流水页时，才显示底部导航栏 */}
      {!isKeyboardVisible && !selectedArticle && !showAllTransactions && (
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
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white' 
  }
});

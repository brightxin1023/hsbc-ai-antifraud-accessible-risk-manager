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

/**
 * 应用入口：统一管理登录态、当前 Tab、冻结状态与全局业务状态。
 *
 * 二级页（交易流水/文章详情）用 showAllTransactions / selectedArticle 局部开关控制，
 * 与底部导航解耦：进入二级页时隐藏 Tab 栏，返回后恢复，避免导航状态穿透。
 */
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [isFrozen, setIsFrozen] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // 紧急联系人提升为全局状态：首页/转账页/我的页三处共用，保证告警邮箱与姓名一致
  const [emergencyContact, setEmergencyContact] = useState({
    name: '辛先生',
    phone: '18635556207',
    email: '2795658007@qq.com'
  });

  const [transactions, setTransactions] = useState<any[]>([
    { id: 1, title: '转账 - 某某科技有限公司', time: '11-10 07:24', amount: '- ¥ 8,000.00', isExpense: true, isAbnormal: false },
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
                emergencyContact={emergencyContact}
              />
            )}
            
            {currentPage === 'transfer' && (
              <TransferScreen 
                onFreeze={() => setIsFrozen(true)} onUnfreeze={() => setIsFrozen(false)} 
                addTransaction={addTransaction} userPhone={userPhone} isFrozen={isFrozen}
                emergencyContact={emergencyContact}
              />
            )}
            
            {currentPage === 'tools' && <ToolsScreen />}
            {currentPage === 'edu' && <EduListScreen onSelectArticle={(article) => setSelectedArticle(article)} />}
            {currentPage === 'profile' && (
              <MyProfileScreen 
                userPhone={userPhone} onLogout={handleLogout} 
                emergencyContact={emergencyContact} 
                setEmergencyContact={setEmergencyContact}
              />
            )}
          </>
        )}
      </View>
      
      {/* 键盘弹出或进入二级页时隐藏底部导航：避免遮挡输入框、让二级页全屏聚焦 */}
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
  bottomNavContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white' }
});
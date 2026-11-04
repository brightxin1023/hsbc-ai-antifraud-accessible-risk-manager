import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function App() {
  // 状态：当前在哪个页面（'home' | 'detect' | 'qa' | 'edu'）
  const [currentPage, setCurrentPage] = useState('home');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  const API_URL = 'http://172.20.10.3:8000/api/detect';

  const checkFraud = async () => {
    if (!inputText) return Alert.alert("提示", "请输入可疑信息");
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      
      if (data.risk_level === 'high') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          "⚠️ 高危诈骗拦截", 
          `识别类型：${data.scam_type}\n建议操作：${data.suggestion}\n\n是否立刻冻结账户？`,
          [
            { text: "取消", style: "cancel" },
            { text: "一键冻结", style: "destructive", onPress: () => {
                setIsFrozen(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                Alert.alert("🛡️ 已冻结", "资金已保护，已自动通知您的家属。");
            }}
          ]
        );
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert("✅ 交易安全", "未发现明显诈骗特征");
      }
    } catch (error) {
      Alert.alert("网络错误", "无法连接到后端");
    } finally {
      setLoading(false);
    }
  };

  // 底部导航栏组件
  const BottomNav = () => (
    <View style={styles.navBar}>
      <Pressable onPress={() => setCurrentPage('home')} style={styles.navItem} accessibilityRole="button" accessibilityLabel="首页">
        <Text style={[styles.navText, currentPage === 'home' && styles.navTextActive]}>🏠 首页</Text>
      </Pressable>
      <Pressable onPress={() => setCurrentPage('detect')} style={styles.navItem} accessibilityRole="button" accessibilityLabel="智能检测">
        <Text style={[styles.navText, currentPage === 'detect' && styles.navTextActive]}>🛡️ 检测</Text>
      </Pressable>
      <Pressable onPress={() => setCurrentPage('qa')} style={styles.navItem} accessibilityRole="button" accessibilityLabel="反诈问答">
        <Text style={[styles.navText, currentPage === 'qa' && styles.navTextActive]}>💬 问答</Text>
      </Pressable>
      <Pressable onPress={() => setCurrentPage('edu')} style={styles.navItem} accessibilityRole="button" accessibilityLabel="反诈科普">
        <Text style={[styles.navText, currentPage === 'edu' && styles.navTextActive]}>📖 科普</Text>
      </Pressable>
    </View>
  );

  // 页面：首页（登录 + 交易流水）
  const HomePage = () => (
    <ScrollView style={styles.pageContainer}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>账户已安全绑定 (无障碍登录)</Text>
        <Text style={styles.headerSubtitle}>尾号 8888 储蓄卡</Text>
      </View>
      <Text style={styles.sectionTitle}>近期交易流水</Text>
      <View style={styles.transactionCard}>
        <Text style={styles.txText}>转账 - 某某科技有限公司</Text>
        <Text style={styles.txAmount}>- ¥ 8,000.00</Text>
      </View>
      <View style={styles.transactionCard}>
        <Text style={styles.txText}>收款 - 工资入账</Text>
        <Text style={styles.txAmountPositive}>+ ¥ 12,500.00</Text>
      </View>
      {isFrozen && <Text style={styles.frozenAlert}>⚠️ 账户已冻结，拦截异常转账</Text>}
      
      <Pressable style={styles.sosButton} onPress={() => Alert.alert("📞 人工协助", "正在拨打专属客服...")}>
        <Text style={styles.buttonText}>一键呼叫人工协助</Text>
      </Pressable>
    </ScrollView>
  );

  // 页面：检测页（你原有的）
  const DetectPage = () => (
    <View style={styles.pageContainer}>
      <Text style={styles.sectionTitle}>AI 异常交易检测</Text>
      <TextInput
        style={styles.input}
        placeholder="请粘贴可疑聊天记录或转账附言"
        multiline
        value={inputText}
        onChangeText={setInputText}
      />
      <Pressable style={styles.actionButton} onPress={checkFraud} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>开始 AI 检测</Text>}
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'detect' && <DetectPage />}
      {/* 其他页面后续加 */}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  pageContainer: { flex: 1, padding: 20 },
  headerCard: { backgroundColor: '#2E7D32', padding: 20, borderRadius: 12, marginBottom: 20 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: 'white', fontSize: 16, marginTop: 5 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  transactionCard: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  txText: { fontSize: 18 },
  txAmount: { fontSize: 18, fontWeight: 'bold', color: '#D32F2F' },
  txAmountPositive: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32' },
  frozenAlert: { color: '#D32F2F', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 15, fontSize: 18, height: 150, textAlignVertical: 'top', marginBottom: 20 },
  actionButton: { backgroundColor: '#D32F2F', padding: 18, borderRadius: 10, alignItems: 'center' },
  sosButton: { backgroundColor: '#FF9800', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  navBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#ddd' },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 16, color: '#666' },
  navTextActive: { color: '#D32F2F', fontWeight: 'bold' }
});
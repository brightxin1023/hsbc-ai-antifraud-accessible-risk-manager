import React from 'react';
import { ScrollView, View, Text, Pressable, Alert, StyleSheet } from 'react-native';

export default function HomeScreen({ isFrozen, userPhone, onLogout }: any) {
  // 打码手机号
  const maskedPhone = userPhone ? `${userPhone.substring(0, 3)}****${userPhone.substring(7)}` : '';
  // 💡 动态生成尾号：截取手机号的最后四位作为卡尾号
  const cardTail = userPhone ? userPhone.substring(7) : '8888';

  const confirmLogout = () => {
    Alert.alert("退出登录", "确定要安全退出当前账户吗？", [
      { text: "取消", style: "cancel" },
      { text: "退出", style: "destructive", onPress: onLogout }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={styles.headerTitle}>账户已安全绑定</Text>
            <Text style={styles.headerSubtitle}>绑定账号: {maskedPhone}</Text>
            {/* 💡 这里不再写死 8888，而是动态显示 */}
            <Text style={styles.headerSubtitle}>尾号 {cardTail} 储蓄卡</Text>
          </View>
          <Pressable onPress={confirmLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>退出登录</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionTitle}>近期交易流水</Text>
      
      <View style={[styles.txCard, isFrozen && styles.frozenCard]}>
        <View>
          <Text style={styles.txText}>转账 - 某某科技有限公司</Text>
          {isFrozen && <Text style={styles.alertText}>⚠️ 该交易已被智能拦截</Text>}
        </View>
        <Text style={[styles.txAmount, isFrozen && { textDecorationLine: 'line-through' }]}>
          - ¥ 8,000.00
        </Text>
      </View>

      <View style={styles.txCard}>
        <Text style={styles.txText}>收款 - 工资入账</Text>
        <Text style={styles.txAmountPos}>+ ¥ 12,500.00</Text>
      </View>
      
      {isFrozen && <Text style={styles.frozenAlert}>🔒 您的账户安全保护中</Text>}
      
      <Pressable style={styles.sosButton} onPress={() => Alert.alert("📞 人工协助", "正在拨打专属客服...")}>
        <Text style={styles.buttonText}>一键呼叫人工协助</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  headerCard: { backgroundColor: '#2E7D32', padding: 20, borderRadius: 12, marginBottom: 20 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: 'white', fontSize: 16, marginTop: 5, opacity: 0.9 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  logoutText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  txCard: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 2, borderColor: 'transparent' },
  txText: { fontSize: 18, fontWeight: '500' },
  txAmount: { fontSize: 18, fontWeight: 'bold', color: '#D32F2F' },
  txAmountPos: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32' },
  frozenCard: { borderColor: '#D32F2F', backgroundColor: '#ffebee' },
  alertText: { color: '#D32F2F', fontWeight: 'bold', marginTop: 5, fontSize: 14 },
  frozenAlert: { color: '#D32F2F', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
  sosButton: { backgroundColor: '#FF9800', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});
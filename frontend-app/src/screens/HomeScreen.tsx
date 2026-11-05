import React from 'react';
import { ScrollView, View, Text, Pressable, Alert, StyleSheet } from 'react-native';

// 接收父组件传来的 isFrozen 状态
export default function HomeScreen({ isFrozen }: { isFrozen: boolean }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>账户已安全绑定</Text>
        <Text style={styles.headerSubtitle}>尾号 8888 储蓄卡</Text>
      </View>
      <Text style={styles.sectionTitle}>近期交易流水</Text>
      
      {/* 受状态联动的交易卡片 */}
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
  headerSubtitle: { color: 'white', fontSize: 16, marginTop: 5 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  
  // 普通流水卡片
  txCard: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 2, borderColor: 'transparent' },
  txText: { fontSize: 18, fontWeight: '500' },
  txAmount: { fontSize: 18, fontWeight: 'bold', color: '#D32F2F' },
  txAmountPos: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32' },
  
  // 冻结状态联动的样式
  frozenCard: { borderColor: '#D32F2F', backgroundColor: '#ffebee' },
  alertText: { color: '#D32F2F', fontWeight: 'bold', marginTop: 5, fontSize: 14 },
  frozenAlert: { color: '#D32F2F', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
  
  sosButton: { backgroundColor: '#FF9800', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});
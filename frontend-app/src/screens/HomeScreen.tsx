import React from 'react';
import { ScrollView, View, Text, Pressable, Alert, StyleSheet } from 'react-native';

export default function HomeScreen({ isFrozen, userPhone, onLogout, transactions }: any) {
  const maskedPhone = userPhone ? `${userPhone.substring(0, 3)}****${userPhone.substring(7)}` : '';
  const cardTail = userPhone ? userPhone.substring(7) : '8888';

  const confirmLogout = () => {
    Alert.alert("退出登录", "确定要安全退出当前账户吗？", [
      { text: "取消", style: "cancel" },
      { text: "退出", style: "destructive", onPress: onLogout }
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={styles.headerTitle} accessibilityRole="header">账户已安全绑定</Text>
            <Text style={styles.headerSubtitle}>绑定账号: {maskedPhone}</Text>
            <Text style={styles.headerSubtitle}>尾号 {cardTail} 储蓄卡</Text>
          </View>
          <Pressable onPress={confirmLogout} style={styles.logoutBtn} accessibilityLabel="退出登录">
            <Text style={styles.logoutText}>退出</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionTitle} accessibilityRole="header">近期交易流水</Text>
      
      <View style={styles.listContainer}>
        {transactions.map((tx: any, index: number) => {
          // 提前计算好当前交易的状态文案，供读屏软件使用
          let accessibilityStatus = '状态正常。';
          if (tx.isAbnormal) accessibilityStatus = '状态异常，资金已拦截。';
          else if (tx.isRisk === 'high') accessibilityStatus = '高危风险交易，已汇出。';
          else if (tx.isRisk === 'medium') accessibilityStatus = '疑似风险交易，已汇出。';

          return (
            <View 
              key={tx.id} 
              style={[styles.listItem, index !== transactions.length - 1 && styles.listItemBorder]}
              accessible={true}
              accessibilityLabel={`${tx.title}，时间${tx.time}，金额${tx.amount}。${accessibilityStatus}`}
            >
              <View style={styles.txLeft}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  
                  {/* 🚨 异常拦截标签（资金没转出） */}
                  {tx.isAbnormal && (
                    <View style={styles.badgeError}>
                      <Text style={styles.badgeErrorText}>🚨 异常拦截</Text>
                    </View>
                  )}

                  {/* 🚨 高危强制转出标签（深红） */}
                  {tx.isRisk === 'high' && !tx.isAbnormal && (
                    <View style={styles.badgeHighRisk}>
                      <Text style={styles.badgeHighRiskText}>🚨 高危交易</Text>
                    </View>
                  )}

                  {/* ⚠️ 中危强制转出标签（黄色） */}
                  {tx.isRisk === 'medium' && !tx.isAbnormal && (
                    <View style={styles.badgeWarning}>
                      <Text style={styles.badgeWarningText}>⚠️ 疑似风险</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>
              
              <Text style={[
                styles.txAmount, 
                tx.isExpense ? { color: '#333' } : { color: '#2E7D32' }, 
                tx.isAbnormal && { textDecorationLine: 'line-through', color: '#999' } // 只有被拦截才划线变灰
              ]}>
                {tx.amount}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.serviceBox}>
        <Text style={styles.serviceText}>遇到不明扣款或疑似诈骗？</Text>
        <Pressable 
          style={styles.sosButton} 
          onPress={() => Alert.alert("📞 人工协助", "正在为您转接专属反诈客服...")}
          accessibilityLabel="一键呼叫人工协助，转接专属反诈客服"
        >
          <Text style={styles.buttonText}>📞 一键呼叫人工协助</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, backgroundColor: '#f0f2f5' },
  headerCard: { backgroundColor: '#2E7D32', padding: 20, borderRadius: 12, marginBottom: 25, elevation: 4 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: 'white', fontSize: 15, marginTop: 5, opacity: 0.9 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  logoutText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  listContainer: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  listItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  txLeft: { flex: 1 },
  txTitle: { fontSize: 16, fontWeight: '500', color: '#333', marginRight: 8 },
  txTime: { fontSize: 13, color: '#999', marginTop: 6 },
  txAmount: { fontSize: 18, fontWeight: 'bold' },
  
  // 🚨 红色拦截标签（资金未转出）
  badgeError: { backgroundColor: '#FFEBEE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FFCDD2', marginLeft: 8 },
  badgeErrorText: { fontSize: 12, color: '#D32F2F', fontWeight: 'bold' },
  
  // 🚨 深红色高危转出标签
  badgeHighRisk: { backgroundColor: '#F44336', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  badgeHighRiskText: { fontSize: 12, color: '#FFFFFF', fontWeight: 'bold' },

  // ⚠️ 黄色中危风险标签
  badgeWarning: { backgroundColor: '#FFF8E1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FFE082', marginLeft: 8 },
  badgeWarningText: { fontSize: 12, color: '#F57F17', fontWeight: 'bold' },

  serviceBox: { backgroundColor: '#FFF3E0', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FFE0B2' },
  serviceText: { fontSize: 15, color: '#E65100', marginBottom: 12, fontWeight: 'bold' },
  sosButton: { backgroundColor: '#FF9800', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
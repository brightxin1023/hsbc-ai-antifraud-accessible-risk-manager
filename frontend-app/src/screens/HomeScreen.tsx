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
          let accessibilityStatus = '状态正常，低风险。';
          if (tx.isAbnormal) accessibilityStatus = '状态异常，资金已拦截。';
          else if (tx.isRisk === 'high') accessibilityStatus = '高度风险交易，已汇出。';
          else if (tx.isRisk === 'medium') accessibilityStatus = '疑似风险交易，已汇出。';

          const rawAmount = tx.amount || '';
          const isExpense = tx.isExpense;
          const cleanAmount = rawAmount.replace(/^[-+]\s*/, ''); 

          return (
            <View 
              key={tx.id} 
              style={[styles.listItem, index !== transactions.length - 1 && styles.listItemBorder]}
              accessible={true}
              accessibilityLabel={`${tx.title}，时间${tx.time}，金额${isExpense ? '减' : '加'}${cleanAmount}。${accessibilityStatus}`}
            >
              <View style={styles.txLeft}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  
                  {tx.isAbnormal && (
                    <View style={styles.badgeError}>
                      <Text style={styles.badgeErrorText}>🛑 异常拦截</Text>
                    </View>
                  )}
                  {tx.isRisk === 'high' && !tx.isAbnormal && (
                    <View style={styles.badgeHighRisk}>
                      <Text style={styles.badgeHighRiskText}>🚨 高度风险</Text>
                    </View>
                  )}
                  {tx.isRisk === 'medium' && !tx.isAbnormal && (
                    <View style={styles.badgeWarning}>
                      <Text style={styles.badgeWarningText}>⚠️ 疑似风险</Text>
                    </View>
                  )}
                  {(!tx.isRisk || tx.isRisk === 'low') && !tx.isAbnormal && (
                    <View style={styles.badgeLowRisk}>
                      <Text style={styles.badgeLowRiskText}>✅ 低风险</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>
              
              <View style={styles.amountContainer}>
                
                {/* 🚀 纯几何图形绘制符号，彻底解决字体粗细不一的问题 */}
                {isExpense ? (
                  // 减号：长度 12，粗细 2
                  <View style={[styles.customMinusSign, tx.isAbnormal && { backgroundColor: '#999' }]} />
                ) : (
                  // 加号：外包 12x12 容器，里面横竖交叉，横线长度和粗细与减号绝对一致
                  <View style={styles.customPlusWrapper}>
                    <View style={styles.plusHorizontal} />
                    <View style={styles.plusVertical} />
                  </View>
                )}
                
                {/* 数字与删除线 */}
                <View style={styles.amountTextWrapper}>
                  <Text style={[
                    styles.txAmount, 
                    isExpense ? { color: '#333' } : { color: '#4CAF50' }, 
                    tx.isAbnormal && { color: '#999' }
                  ]}>
                    {cleanAmount}
                  </Text>
                  
                  {/* 异常拦截的鲜艳红线，绝对居中 */}
                  {tx.isAbnormal && (
                    <View style={styles.redStrikethrough} />
                  )}
                </View>
              </View>

            </View>
          );
        })}
      </View>

      <View style={styles.serviceBox}>
        <Text style={styles.serviceText}>遇到不明扣款或疑似诈骗？</Text>
        <Pressable style={styles.sosButton} onPress={() => Alert.alert("📞 人工协助", "正在为您转接专属反诈客服...")}>
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
  
  // 🚀 金额排版终极样式
  amountContainer: { flexDirection: 'row', alignItems: 'center' },
  
  // 减号固定样式
  customMinusSign: { 
    width: 12, 
    height: 2, 
    backgroundColor: '#333', 
    marginRight: 4, 
    borderRadius: 1 
  },
  
  // 加号容器，确保占位大小与减号一致
  customPlusWrapper: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  // 加号横线：和减号一模一样
  plusHorizontal: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 1,
  },
  // 加号竖线：粗 2，长 12
  plusVertical: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 1,
  },
  
  // 文字容器锁高
  amountTextWrapper: {
    position: 'relative',
    justifyContent: 'center',
    height: 24, 
  },
  txAmount: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    lineHeight: 24 
  },
  
  // 绝对居中的穿透红线
  redStrikethrough: {
    position: 'absolute',
    left: -2,
    right: -2,
    height: 1.5,
    backgroundColor: '#FF3B30',
    top: 11.25, 
  },

  // --- 标签样式保持不变 ---
  badgeError: { backgroundColor: '#FFEBEE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FFCDD2', marginLeft: 8 },
  badgeErrorText: { fontSize: 12, color: '#D32F2F', fontWeight: 'bold' },
  badgeHighRisk: { backgroundColor: '#D32F2F', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  badgeHighRiskText: { fontSize: 12, color: '#FFFFFF', fontWeight: 'bold' },
  badgeWarning: { backgroundColor: '#FFF8E1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FFE082', marginLeft: 8 },
  badgeWarningText: { fontSize: 12, color: '#F57F17', fontWeight: 'bold' },
  badgeLowRisk: { backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#A5D6A7', marginLeft: 8 },
  badgeLowRiskText: { fontSize: 12, color: '#2E7D32', fontWeight: 'bold' },

  serviceBox: { backgroundColor: '#FFF3E0', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FFE0B2' },
  serviceText: { fontSize: 15, color: '#E65100', marginBottom: 12, fontWeight: 'bold' },
  sosButton: { backgroundColor: '#FF9800', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
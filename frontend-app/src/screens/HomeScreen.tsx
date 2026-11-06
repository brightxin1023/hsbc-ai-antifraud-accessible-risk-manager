import React from 'react';
import { ScrollView, View, Text, Pressable, Alert, StyleSheet } from 'react-native';

export default function HomeScreen({ isFrozen, userPhone, onLogout, transactions, onUnfreeze }: any) {
  const maskedPhone = userPhone ? `${userPhone.substring(0, 3)}****${userPhone.substring(7)}` : '';
  const cardTail = userPhone ? userPhone.substring(7) : '8888';

  const confirmLogout = () => {
    Alert.alert("退出登录", "确定要安全退出当前账户吗？", [
      { text: "取消", style: "cancel" },
      { text: "退出", style: "destructive", onPress: onLogout }
    ]);
  };

  const handleAppeal = () => {
    Alert.alert(
      "解除冻结（申诉）", 
      "为了保护您的资金安全，当前账户已限制出账。如需解冻，请呼叫人工客服核实身份。",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "📞 一键呼叫人工客服", 
          onPress: () => {
            Alert.alert(
              "📞 正在接通", 
              "正在为您转接反诈专属人工客服...",
              [
                { 
                  text: "OK", 
                  onPress: () => {
                    onUnfreeze(); 
                    Alert.alert("✅ 解冻成功", "人工客服已为您核实身份，账户已恢复正常使用。请警惕陌生转账！");
                  } 
                }
              ]
            );
          } 
        }
      ]
    );
  };

  // 🚀 优化：全场景包容的人工客服呼叫弹窗
  const handleSOSCall = () => {
    Alert.alert(
      "📞 联系人工客服",
      "无论您是不懂操作、遇到账户异常，还是怀疑遭遇了诈骗，都可以随时联系我们的专属人工客服。是否现在呼叫？",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "立即呼叫", 
          onPress: () => {
            Alert.alert(
              "📞 正在接通",
              "正在为您转接专属人工客服，请稍候...",
              [{ text: "OK" }]
            );
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* 🚀 只有 isFrozen 为 true 时，才展示这个红框 */}
      {isFrozen && (
        <View style={styles.frozenBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>🛡️</Text>
            <Text style={styles.frozenBannerTitle}>账户已进入安全保护状态</Text>
          </View>
          <Text style={styles.frozenBannerText}>
            检测到高危风险，资金已自动拦截。保护期间，您的工资入账及日常水电费自动扣款均不受影响。
          </Text>
          <Pressable style={styles.appealBtn} onPress={handleAppeal}>
            <Text style={styles.appealBtnText}>📞 呼叫人工客服申诉解冻</Text>
          </Pressable>
        </View>
      )}

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
          let accessibilityStatus = '安全交易。';
          if (tx.isAbnormal) accessibilityStatus = '状态异常，资金已拦截。';
          else if (tx.isRisk === 'high') accessibilityStatus = '高危交易，已汇出。';
          else if (tx.isRisk === 'medium') accessibilityStatus = '可疑交易，已汇出。';

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
                      <Text style={styles.badgeHighRiskText}>🚨 高危交易</Text>
                    </View>
                  )}
                  {tx.isRisk === 'medium' && !tx.isAbnormal && (
                    <View style={styles.badgeWarning}>
                      <Text style={styles.badgeWarningText}>⚠️ 可疑交易</Text>
                    </View>
                  )}
                  {(!tx.isRisk || tx.isRisk === 'low') && !tx.isAbnormal && (
                    <View style={styles.badgeLowRisk}>
                      <Text style={styles.badgeLowRiskText}>✅ 安全交易</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>
              
              <View style={styles.amountContainer}>
                {isExpense ? (
                  <View style={[styles.customMinusSign, tx.isAbnormal && { backgroundColor: '#999' }]} />
                ) : (
                  <View style={styles.customPlusWrapper}>
                    <View style={styles.plusHorizontal} />
                    <View style={styles.plusVertical} />
                  </View>
                )}
                
                <View style={styles.amountTextWrapper}>
                  <Text style={[
                    styles.txAmount, 
                    isExpense ? { color: '#333' } : { color: '#4CAF50' }, 
                    tx.isAbnormal && { color: '#999' }
                  ]}>
                    {cleanAmount}
                  </Text>
                  
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
        {/* 🚀 优化：包容万象的提问 */}
        <Text style={styles.serviceText}>遇到操作疑问、账户异常或其他资金问题？</Text>
        <Pressable style={styles.sosButton} onPress={handleSOSCall}>
          {/* 🚀 优化：更标准的表述 */}
          <Text style={styles.buttonText}>📞 呼叫人工客服</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, backgroundColor: '#f0f2f5' },
  
  // 🚀 冻结横幅样式
  frozenBanner: { backgroundColor: '#FFEBEE', padding: 20, borderRadius: 12, borderWidth: 2, borderColor: '#D32F2F', marginBottom: 20 },
  frozenBannerTitle: { color: '#D32F2F', fontSize: 18, fontWeight: 'bold' },
  frozenBannerText: { color: '#B71C1C', fontSize: 14, lineHeight: 22, marginBottom: 15 },
  appealBtn: { backgroundColor: '#D32F2F', padding: 12, borderRadius: 8, alignItems: 'center' },
  appealBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

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
  
  amountContainer: { flexDirection: 'row', alignItems: 'center' },
  customMinusSign: { width: 12, height: 2, backgroundColor: '#333', marginRight: 4, borderRadius: 1 },
  customPlusWrapper: { width: 12, height: 12, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  plusHorizontal: { position: 'absolute', width: 12, height: 2, backgroundColor: '#4CAF50', borderRadius: 1 },
  plusVertical: { position: 'absolute', width: 2, height: 12, backgroundColor: '#4CAF50', borderRadius: 1 },
  amountTextWrapper: { position: 'relative', justifyContent: 'center', height: 24 },
  txAmount: { fontSize: 18, fontWeight: 'bold', lineHeight: 24 },
  redStrikethrough: { position: 'absolute', left: -2, right: -2, height: 1.5, backgroundColor: '#FF3B30', top: 11.25 },
  
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
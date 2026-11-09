import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { alertFamilyApi } from '../services/api';
import CustomAlert from '../components/CustomAlert';

export default function HomeScreen({ isFrozen, userPhone, onLogout, transactions, onUnfreeze }: any) {
  const maskedPhone = userPhone ? `${userPhone.substring(0, 3)}****${userPhone.substring(7)}` : '';
  const cardTail = userPhone ? userPhone.substring(7) : '8888';

  const [alertConfig, setAlertConfig] = useState<any>({ visible: false });
  const showAlert = (title: string, message: string, buttons: any[] = [{ text: 'OK' }]) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const confirmLogout = () => {
    showAlert("退出登录", "确定要安全退出当前账户吗？", [
      { text: "取消", style: "cancel" },
      { text: "退出", style: "destructive", onPress: onLogout }
    ]);
  };

  const handleAppeal = () => {
    showAlert(
      "解除冻结（申诉）", 
      "为了保护您的资金安全，当前账户已限制出账。如需解冻，请呼叫人工客服核实身份。",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "📞 一键呼叫人工客服", 
          onPress: () => {
            showAlert(
              "📞 正在接通", 
              "正在为您转接反诈专属人工客服...",
              [{ 
                text: "OK", 
                onPress: () => {
                  onUnfreeze(); 
                  showAlert("✅ 解冻成功", "人工客服已为您核实身份，账户已恢复正常使用。请警惕陌生转账！");
                } 
              }]
            );
          } 
        }
      ]
    );
  };

  const handleSOSCall = () => {
    showAlert(
      "📞 联系人工客服",
      "无论您是不懂操作、遇到账户异常，还是怀疑遭遇了诈骗，都可以随时联系我们的专属人工客服。是否现在呼叫？",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "📞 立即呼叫", 
          onPress: () => {
            showAlert("📞 正在接通", "正在为您转接专属人工客服，请稍候...", [{ text: "OK" }]);
          }
        }
      ]
    );
  };

  const handleCallFamily = () => {
    showAlert(
      "📞 呼叫紧急联系人",
      "是否立即致电您的紧急联系人【辛先生】？",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "📞 立即致电", 
          onPress: () => showAlert("📞 正在呼叫", "正在呼叫【辛先生】(186****6207)...") 
        }
      ]
    );
  };

  const handleEmailAlert = () => {
    showAlert(
      "✉️ 发送紧急告警",
      "将向紧急联系人【辛先生】发送紧急求助邮件，是否确认？",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "✉️ 确认发送", 
          onPress: async () => {
            try {
              await alertFamilyApi("", "紧急求助", userPhone);
              showAlert("✅ 发送成功", "紧急求助邮件已发送至【辛先生】的邮箱。");
            } catch (error) {
              showAlert("❌ 发送失败", "网络异常，请稍后重试。");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {isFrozen && (
          <View style={styles.frozenBanner} accessibilityLiveRegion="polite">
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 24, marginRight: 8 }} accessible={false}>🛡️</Text>
              <Text style={styles.frozenBannerTitle}>账户已进入安全保护状态</Text>
            </View>
            <Text style={styles.frozenBannerText}>
              检测到高危风险，资金已自动拦截。保护期间，您的工资入账及日常水电费自动扣款均不受影响。
            </Text>
            <Pressable style={styles.appealBtn} onPress={handleAppeal} accessibilityRole="button" accessibilityLabel="呼叫人工客服申诉解冻">
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
            <Pressable onPress={confirmLogout} style={styles.logoutBtn} accessibilityRole="button" accessibilityLabel="退出登录">
              <Text style={styles.logoutText}>退出</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.familyCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{ fontSize: 32, marginRight: 12 }} accessible={false}>👨‍👩‍👧</Text>
            <View>
              <Text style={styles.familyTitle}>家庭安全守护已开启</Text>
              <Text style={styles.familyDesc}>紧急联系人：辛先生</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable style={[styles.familyBtn, { backgroundColor: '#1976D2', flex: 1 }]} onPress={handleCallFamily} accessibilityRole="button" accessibilityLabel="呼叫紧急联系人辛先生">
              <Text style={styles.familyBtnText}>📞 呼叫</Text>
            </Pressable>
            <Pressable style={[styles.familyBtn, { backgroundColor: '#D32F2F', flex: 1 }]} onPress={handleEmailAlert} accessibilityRole="button" accessibilityLabel="发送紧急告警邮件给辛先生">
              <Text style={styles.familyBtnText}>✉️ 告警</Text>
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
              <View key={tx.id} style={[styles.listItem, index !== transactions.length - 1 && styles.listItemBorder]} accessible={true} accessibilityLabel={`${tx.title}，时间${tx.time}，金额${isExpense ? '减' : '加'}${cleanAmount}。${accessibilityStatus}`}>
                <View style={styles.txLeft}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    {tx.isAbnormal && (
                      <View style={styles.badgeError}><Text style={styles.badgeErrorText}>🛑 异常拦截</Text></View>
                    )}
                    {tx.isRisk === 'high' && !tx.isAbnormal && (
                      <View style={styles.badgeHighRisk}><Text style={styles.badgeHighRiskText}>🚨 高危交易</Text></View>
                    )}
                    {tx.isRisk === 'medium' && !tx.isAbnormal && (
                      <View style={styles.badgeWarning}><Text style={styles.badgeWarningText}>⚠️ 可疑交易</Text></View>
                    )}
                    {(!tx.isRisk || tx.isRisk === 'low') && !tx.isAbnormal && (
                      <View style={styles.badgeLowRisk}><Text style={styles.badgeLowRiskText}>✅ 安全交易</Text></View>
                    )}
                  </View>
                  <Text style={styles.txTime}>{tx.time}</Text>
                </View>
                
                <View style={styles.amountContainer}>
                  {isExpense ? (
                    <View style={[styles.customMinusSign, tx.isAbnormal && { backgroundColor: '#666' }]} />
                  ) : (
                    <View style={styles.customPlusWrapper}>
                      <View style={styles.plusHorizontal} />
                      <View style={styles.plusVertical} />
                    </View>
                  )}
                  <View style={styles.amountTextWrapper}>
                    {/* 收入金额颜色改为更深邃的绿色，异常拦截金额改为深灰色 */}
                    <Text style={[styles.txAmount, isExpense ? { color: '#333' } : { color: '#2E7D32' }, tx.isAbnormal && { color: '#666' }]}>
                      {cleanAmount}
                    </Text>
                    {tx.isAbnormal && (<View style={styles.redStrikethrough} />)}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.serviceBox}>
          <Text style={styles.serviceText}>遇到操作疑问、账户异常或其他资金问题？</Text>
          <Pressable style={styles.sosButton} onPress={handleSOSCall} accessibilityRole="button" accessibilityLabel="呼叫人工客服">
            <Text style={styles.buttonText}>📞 呼叫人工客服</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 全局自定义弹窗 */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, backgroundColor: '#f0f2f5' },
  
  frozenBanner: { backgroundColor: '#FFEBEE', padding: 20, borderRadius: 12, borderWidth: 2, borderColor: '#D32F2F', marginBottom: 20 },
  frozenBannerTitle: { color: '#D32F2F', fontSize: 22, fontWeight: 'bold' },
  frozenBannerText: { color: '#B71C1C', fontSize: 16, lineHeight: 24, marginBottom: 15 },
  appealBtn: { backgroundColor: '#D32F2F', padding: 16, borderRadius: 8, alignItems: 'center' },
  appealBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  headerCard: { backgroundColor: '#2E7D32', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 4 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  // 对比度优化：去掉 opacity，让白字在绿底上绝对清晰
  headerSubtitle: { color: 'white', fontSize: 18, marginTop: 6 }, 
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  logoutText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  familyCard: { backgroundColor: '#E3F2FD', borderRadius: 12, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#BBDEFB' },
  familyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1565C0' },
  // 对比度优化：将浅蓝加深，提升在浅色背景上的可读性
  familyDesc: { fontSize: 16, color: '#0D47A1', marginTop: 4 }, 
  familyBtn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  familyBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  sectionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  listContainer: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  listItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  txLeft: { flex: 1 },
  txTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginRight: 8 },
  
  // 对比度优化：时间从 #999 加深到 #666
  txTime: { fontSize: 16, color: '#666', marginTop: 8 }, 
  
  amountContainer: { flexDirection: 'row', alignItems: 'center' },
  customMinusSign: { width: 14, height: 2.5, backgroundColor: '#333', marginRight: 6, borderRadius: 1 },
  customPlusWrapper: { width: 14, height: 14, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  // 对比度优化：加号图标同步换成深绿
  plusHorizontal: { position: 'absolute', width: 14, height: 2.5, backgroundColor: '#2E7D32', borderRadius: 1 },
  plusVertical: { position: 'absolute', width: 2.5, height: 14, backgroundColor: '#2E7D32', borderRadius: 1 },
  amountTextWrapper: { position: 'relative', justifyContent: 'center', height: 30 },
  txAmount: { fontSize: 24, fontWeight: 'bold', lineHeight: 30 },
  redStrikethrough: { position: 'absolute', left: -2, right: -2, height: 2, backgroundColor: '#FF3B30', top: 14 },
  
  badgeError: { backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#FFCDD2', marginLeft: 8 },
  badgeErrorText: { fontSize: 14, color: '#D32F2F', fontWeight: 'bold' },
  badgeHighRisk: { backgroundColor: '#D32F2F', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 8 },
  badgeHighRiskText: { fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' },
  badgeWarning: { backgroundColor: '#FFF8E1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#FFE082', marginLeft: 8 },
  // 对比度优化：可疑交易文字从亮橙 #F57F17 加深至深橙 #D84315，确保在白/黄底上清晰可见
  badgeWarningText: { fontSize: 14, color: '#D84315', fontWeight: 'bold' }, 
  badgeLowRisk: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#A5D6A7', marginLeft: 8 },
  badgeLowRiskText: { fontSize: 14, color: '#2E7D32', fontWeight: 'bold' },
  
  serviceBox: { backgroundColor: '#FFF3E0', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FFE0B2' },
  serviceText: { fontSize: 18, color: '#E65100', marginBottom: 15, fontWeight: 'bold' },
  sosButton: { backgroundColor: '#FF9800', width: '100%', padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
});
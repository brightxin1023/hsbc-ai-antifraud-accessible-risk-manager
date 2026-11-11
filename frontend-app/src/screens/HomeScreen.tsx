import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { alertFamilyApi } from '../services/api';
import CustomAlert from '../components/CustomAlert';

/**
 * 首页：展示账户安全状态、家庭守护入口与最近三笔交易流水。
 */
export default function HomeScreen({ isFrozen, userPhone, onLogout, transactions, onUnfreeze, onViewAllTransactions, emergencyContact }: any) {
  const recentTransactions = transactions.slice(0, 3);
  const maskedContactPhone = emergencyContact.phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');

  const [alertConfig, setAlertConfig] = useState<any>({ visible: false });
  const showAlert = (title: string, message: string, buttons: any[] = [{ text: 'OK' }]) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const handleAppeal = () => {
    showAlert(
      "解除冻结（申诉）", 
      "为了保护您的资金安全，当前账户已限制出账。如需解冻，请呼叫人工客服核实身份。",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "一键呼叫人工客服", 
          onPress: () => {
            Linking.openURL('tel:95588').catch(() => {
              showAlert("提示", "您的设备不支持拨号功能。");
            });
          } 
        }
      ]
    );
  };

  const handleCallFamily = () => {
    showAlert("呼叫紧急联系人", `是否立即致电您的紧急联系人【${emergencyContact.name}】(${maskedContactPhone})？`, [
      { text: "取消", style: "cancel" },
      { text: "立即致电", onPress: () => {
        Linking.openURL(`tel:${emergencyContact.phone}`).catch(() => {
          showAlert("提示", "您的设备不支持拨号功能。");
        });
      }}
    ]);
  };

  const handleEmailAlert = () => {
    showAlert("发送紧急告警", `将向紧急联系人【${emergencyContact.name}】发送紧急求助邮件，是否确认？`, [
      { text: "取消", style: "cancel" },
      { text: "确认发送", onPress: async () => {
        try {
          await alertFamilyApi("", "紧急求助", userPhone, emergencyContact.email);
          showAlert("发送成功", `紧急求助邮件已发送至【${emergencyContact.name}】的邮箱。`);
        } catch (error) {
          showAlert("发送失败", "网络异常，请稍后重试。");
        }
      }}
    ]);
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
              <Text style={styles.appealBtnText}>呼叫人工客服申诉解冻</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.headerCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginRight: 16 }} accessible={false}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle} accessibilityRole="header">反诈防护已全面开启</Text>
              <Text style={styles.headerSubtitle}>智能风控正在实时守护您的资金</Text>
            </View>
          </View>
        </View>

        <View style={styles.familyCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{ fontSize: 32, marginRight: 12 }} accessible={false}>👨‍👩‍👧</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.familyTitle}>家庭安全守护已开启</Text>
              <Text style={styles.familyDesc}>紧急联系人：{emergencyContact.name}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable style={[styles.familyBtn, { backgroundColor: '#1565C0', flex: 1 }]} onPress={handleCallFamily} accessibilityRole="button" accessibilityLabel={`呼叫紧急联系人${emergencyContact.name}`}>
              <Text style={styles.familyBtnText}>呼叫</Text>
            </Pressable>
            <Pressable style={[styles.familyBtn, { backgroundColor: '#D32F2F', flex: 1 }]} onPress={handleEmailAlert} accessibilityRole="button" accessibilityLabel={`发送紧急告警邮件给${emergencyContact.name}`}>
              <Text style={styles.familyBtnText}>告警</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle} accessibilityRole="header">近期交易流水</Text>
        
        <View style={styles.listContainer}>
          {recentTransactions.map((tx: any, index: number) => {
            let accessibilityStatus = '安全交易。';
            if (tx.isAbnormal) accessibilityStatus = '状态异常，资金已拦截。';
            else if (tx.isRisk === 'high') accessibilityStatus = '高危交易，已汇出。';
            else if (tx.isRisk === 'medium') accessibilityStatus = '可疑交易，已汇出。';

            const rawAmount = tx.amount || '';
            const isExpense = tx.isExpense;
            const cleanAmount = rawAmount.replace(/^[-+]\s*/, ''); 

            return (
              <View key={tx.id} style={[styles.listItem, index !== recentTransactions.length - 1 && styles.listItemBorder]} accessible={true} accessibilityLabel={`${tx.title}，时间${tx.time}，金额${isExpense ? '减' : '加'}${cleanAmount}。${accessibilityStatus}`}>
                <View style={styles.txLeft}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    {tx.isAbnormal && (<View style={styles.badgeError}><Text style={styles.badgeErrorText}>🛑 异常拦截</Text></View>)}
                    {tx.isRisk === 'high' && !tx.isAbnormal && (<View style={styles.badgeHighRisk}><Text style={styles.badgeHighRiskText}>🚨 高危交易</Text></View>)}
                    {tx.isRisk === 'medium' && !tx.isAbnormal && (<View style={styles.badgeWarning}><Text style={styles.badgeWarningText}>⚠️ 可疑交易</Text></View>)}
                    {(!tx.isRisk || tx.isRisk === 'low') && !tx.isAbnormal && (<View style={styles.badgeLowRisk}><Text style={styles.badgeLowRiskText}>✅ 安全交易</Text></View>)}
                  </View>
                  <Text style={styles.txTime}>{tx.time}</Text>
                </View>
                
                <View style={styles.amountContainer}>
                  {isExpense ? (<View style={[styles.customMinusSign, tx.isAbnormal && { backgroundColor: '#666' }]} />) : (
                    <View style={styles.customPlusWrapper}><View style={styles.plusHorizontal} /><View style={styles.plusVertical} /></View>
                  )}
                  <View style={styles.amountTextWrapper}>
                    <Text style={[styles.txAmount, isExpense ? { color: '#333' } : { color: '#2E7D32' }, tx.isAbnormal && { color: '#666', opacity: 0.7 }]}>{cleanAmount}</Text>
                    {tx.isAbnormal && (<View style={styles.redStrikethrough} />)}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable style={styles.viewAllBtn} onPress={onViewAllTransactions} accessibilityRole="button" accessibilityLabel="查看全部交易流水">
          <Text style={styles.viewAllBtnText}>查看全部交易流水 →</Text>
        </Pressable>
      </ScrollView>

      <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} buttons={alertConfig.buttons} onClose={() => setAlertConfig({ ...alertConfig, visible: false })} />
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
  headerCard: { backgroundColor: '#2E7D32', padding: 24, borderRadius: 16, marginBottom: 20, elevation: 4 },
  headerTitle: { color: 'white', fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
  headerSubtitle: { color: 'white', fontSize: 16, opacity: 0.9 },
  familyCard: { backgroundColor: '#E3F2FD', borderRadius: 12, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#BBDEFB' },
  familyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1565C0' },
  familyDesc: { fontSize: 16, color: '#0D47A1', marginTop: 4 }, 
  familyBtn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  familyBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  listContainer: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  listItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  txLeft: { flex: 1 },
  txTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginRight: 8 },
  txTime: { fontSize: 16, color: '#666', marginTop: 8 }, 
  amountContainer: { flexDirection: 'row', alignItems: 'center' },
  customMinusSign: { width: 14, height: 2.5, backgroundColor: '#333', marginRight: 6, borderRadius: 1 },
  customPlusWrapper: { width: 14, height: 14, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
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
  badgeWarningText: { fontSize: 14, color: '#D84315', fontWeight: 'bold' }, 
  badgeLowRisk: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#A5D6A7', marginLeft: 8 },
  badgeLowRiskText: { fontSize: 14, color: '#2E7D32', fontWeight: 'bold' },
  viewAllBtn: { backgroundColor: '#1565C0', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 20, minHeight: 60 },
  viewAllBtnText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
});
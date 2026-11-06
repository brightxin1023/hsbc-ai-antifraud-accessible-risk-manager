import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, StyleSheet, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { detectFraudApi, alertFamilyApi } from '../services/api';

export default function TransferScreen({ onFreeze, addTransaction }: { onFreeze: () => void, addTransaction: (tx: any) => void }) {
  const [payee, setPayee] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  const [bankInfo, setBankInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    if (cardNo.length >= 8) {
      const banks = ['工商银行', '建设银行', '招商银行', '农业银行', '中国银行', '交通银行'];
      const randomBank = banks[parseInt(cardNo.slice(-1)) % banks.length];
      setBankInfo(`已识别为：${randomBank} 储蓄卡`);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      setBankInfo('');
    }
  }, [cardNo]);

  const checkFraud = async () => {
    Keyboard.dismiss();
    if (!payee || !cardNo || !amount) {
      return Alert.alert("提示", "请填写完整的户名、账号和转账金额");
    }
    if (cardNo.length < 8) {
      return Alert.alert("提示", "账号位数不正确，请输入 8 位以上测试账号");
    }

    setLoading(true);
    try {
      const isHighRiskAction = parseFloat(amount) > 5000 || !note;
      
      const combinedText = `收款人户名：${payee}，收款账号：${cardNo}，转账金额：${amount}元，转账附言：${note || '无'}`;
      const data = await detectFraudApi(combinedText);
      
      if (data.risk_level === 'low' && isHighRiskAction) {
        data.risk_level = 'medium';
        data.scam_type = '行为风控异常';
        data.suggestion = '检测到大额或无附言转账，请务必核实收款人身份。';
      }

      setResultData(data);
      
      if (data.risk_level === 'high') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else if (data.risk_level === 'medium') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      setModalVisible(true);
    } catch (error) {
      Alert.alert("网络错误", "无法连接到后端服务");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 强制转账：如果高危依然强行转账，也通知家属！
  const executeTransfer = async (isForced: boolean) => {
    setModalVisible(false);
    
    addTransaction({
      id: Date.now(),
      title: `转账 - ${payee}`,
      time: '刚刚',
      amount: `- ¥ ${parseFloat(amount).toFixed(2)}`,
      isExpense: true,
      isAbnormal: false,
      // 🚀 传递具体的风险等级，用于首页区分标签
      isRisk: isForced ? resultData?.risk_level : false, 
    });

    if (isForced) {
      // 只有高危强制转账，才偷偷发邮件
      if (resultData?.risk_level === 'high') {
        await alertFamilyApi(note || '高危强制转账', resultData.scam_type);
        Alert.alert("✅ 转账成功", "款项已汇出。系统已记录此笔高危交易，并已同步通知您的家属，请注意资金安全。");
      } else {
        Alert.alert("✅ 转账成功", "款项已汇出。系统已记录此笔风险交易。");
      }
    } else {
      Alert.alert("✅ 转账成功", "交易已安全完成，请注意查收。");
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPayee(''); setCardNo(''); setAmount(''); setNote('');
  };

  // 🚀 阻断交易：只有高危才通知家属，中危不通知
  const handleCancelTransfer = async () => {
    setModalVisible(false);
    onFreeze();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    
    addTransaction({
      id: Date.now(),
      title: `转账 - ${payee}`,
      time: '刚刚',
      amount: `- ¥ ${parseFloat(amount).toFixed(2)}`,
      isExpense: true,
      isAbnormal: true,
    });

    if (resultData?.risk_level === 'high') {
      await alertFamilyApi(note || '高危转账拦截', resultData.scam_type);
      Alert.alert("🛡️ 交易已阻断", "资金已保护，并未转出。已为您记录高危风险并通知家属。");
    } else {
      Alert.alert("🛡️ 交易已阻断", "资金已保护，并未转出。已为您记录风险。");
    }
    setPayee(''); setCardNo(''); setAmount(''); setNote('');
  };

  const getModalStyle = () => {
    if (resultData?.risk_level === 'high') {
      return { bg: '#D32F2F', text: 'white', icon: '🚨', title: '高危诈骗拦截', btn1: '无视风险强制转账', btn2: '阻断交易并冻结', btn2Bg: '#B71C1C' };
    } else if (resultData?.risk_level === 'medium') {
      return { bg: '#FFC107', text: '#333', icon: '⚠️', title: '疑似风险提醒', btn1: '无视提醒继续转账', btn2: '暂停转账，核实身份', btn2Bg: '#F57F17' };
    } else {
      return { bg: '#2E7D32', text: 'white', icon: '✅', title: '交易环境安全', btn1: '', btn2: '', btn2Bg: '' };
    }
  };

  const theme = getModalStyle();

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.pageTitle} accessibilityRole="header">账号转账</Text>
            <Text style={styles.pageSubtitle}>您的资金安全由 AI 实时保护</Text>

            <View style={styles.formCard}>
              
              <Text style={styles.label}>户名</Text>
              <TextInput style={styles.input} placeholder="收款人户名/企业账户名" placeholderTextColor="#999" value={payee} onChangeText={setPayee} />

              <Text style={styles.label}>账号</Text>
              <TextInput style={styles.input} placeholder="银行卡号/信用卡号/企业账号" placeholderTextColor="#999" keyboardType="number-pad" maxLength={19} value={cardNo} onChangeText={setCardNo} />
              
              {bankInfo ? (
                <Text style={styles.bankInfoText} accessibilityLiveRegion="polite">🏦 {bankInfo}</Text>
              ) : (
                <View style={{ height: 15 }} />
              )}

              <Text style={styles.label}>转账金额</Text>
              <View style={styles.amountWrapper}>
                <Text style={styles.currencySymbol}>¥</Text>
                <TextInput style={styles.amountInput} placeholder="0.00" placeholderTextColor="#999" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
              </View>

              <Text style={styles.label}>转账附言</Text>
              <TextInput style={styles.textArea} placeholder="选填。可填写转账目的、备忘信息等。若对方要求你转账，可填入对方的目的或话术。" placeholderTextColor="#999" multiline textAlignVertical="top" value={note} onChangeText={setNote} />
            </View>

            <Pressable style={[styles.actionBtn, loading && { opacity: 0.7 }]} onPress={checkFraud} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>确认转账并进行安全检测</Text>}
            </Pressable>

            <Text style={styles.securityTip}>🔒 本笔转账受 AI 盾实时风控保护，如遇诈骗请立即挂断并拨打 96110。</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.bg }]}>
            
            <Text style={styles.modalIcon}>{theme.icon}</Text>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{theme.title}</Text>
            
            <View style={styles.modalInfoBox}>
              <Text style={[styles.modalLabel, { color: theme.text }]}>风险类型：</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>{resultData?.scam_type}</Text>
            </View>
            <View style={styles.modalInfoBox}>
              <Text style={[styles.modalLabel, { color: theme.text }]}>AI 建议：</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>{resultData?.suggestion}</Text>
            </View>

            <View style={styles.modalButtons}>
              {resultData?.risk_level === 'high' || resultData?.risk_level === 'medium' ? (
                <>
                  <Pressable style={[styles.modalBtn, { backgroundColor: 'rgba(0,0,0,0.15)' }]} onPress={() => executeTransfer(true)}>
                    <Text style={[styles.btnText, { color: theme.text }]}>{theme.btn1}</Text>
                  </Pressable>
                  <Pressable style={[styles.modalBtn, { backgroundColor: theme.btn2Bg }]} onPress={handleCancelTransfer}>
                    <Text style={[styles.btnText, { color: 'white' }]}>{theme.btn2}</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable 
                  style={[styles.modalBtn, { backgroundColor: '#1B8A2E' }]} // 🚀 修复：深绿色底色，绝对显眼
                  onPress={() => executeTransfer(false)}
                >
                  {/* 🚀 修复：硬编码纯白文字，绝对不可能隐身 */}
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}>确认转账</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: '#333', marginTop: 10 },
  pageSubtitle: { fontSize: 16, color: '#666', marginBottom: 25 },
  formCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 10 },
  input: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12, fontSize: 18, marginBottom: 5, color: '#333' },
  bankInfoText: { fontSize: 13, color: '#2E7D32', fontWeight: 'bold', marginBottom: 10 },
  amountWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 10, paddingVertical: 12 },
  currencySymbol: { fontSize: 28, fontWeight: 'bold', marginRight: 10, color: '#333' },
  amountInput: { fontSize: 32, fontWeight: 'bold', flex: 1, color: '#333' },
  textArea: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 15, fontSize: 16, height: 100, marginBottom: 10, backgroundColor: '#fafafa', color: '#333' },
  actionBtn: { backgroundColor: '#D32F2F', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  securityTip: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 10 },
  modalIcon: { fontSize: 60, marginBottom: 10 },
  modalTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  modalInfoBox: { flexDirection: 'row', marginBottom: 12, width: '100%', alignItems: 'flex-start' },
  modalLabel: { fontSize: 18, fontWeight: 'bold', width: 90 },
  modalValue: { fontSize: 18, fontWeight: 'bold', flex: 1, lineHeight: 26 },
  modalButtons: { flexDirection: 'column', gap: 10, marginTop: 20, width: '100%' },
  modalBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { fontSize: 18, fontWeight: 'bold' },
});
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, Modal, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { detectFraudApi, alertFamilyApi } from '../services/api';
import CustomAlert from '../components/CustomAlert';

export default function TransferScreen({ onFreeze, onUnfreeze, addTransaction, userPhone, isFrozen }: any) {
  const [payee, setPayee] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  const [bankInfo, setBankInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const [alertConfig, setAlertConfig] = useState<any>({ visible: false });
  const scrollViewRef = useRef<any>(null);

  const showAlert = (title: string, message: string, buttons: any[] = [{ text: '知道了' }]) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const getFormattedTime = () => {
    const date = new Date();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const DD = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${MM}-${DD} ${HH}:${mm}`;
  };

  const triggerHaptic = (level: 'low' | 'medium' | 'high') => {
    if (level === 'low') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (level === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setTimeout(() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); }, 400); 
    } else if (level === 'high') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      setTimeout(() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}); }, 300);
      setTimeout(() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}); }, 600);
      setTimeout(() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}); }, 900);
    }
  };

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
    
    // 核心修复：如果账户处于冻结状态，直接弹窗拦截，阻止往下执行
    if (isFrozen) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return showAlert(
        "🛡️ 账户已被保护性冻结", 
        "检测到您的账户存在高危风险，出账功能已暂停。为保障资金安全，如需继续转账，请先呼叫人工客服核实身份并解除冻结。", 
        [
          { text: "稍后处理", style: "cancel" },
          { 
            text: "📞 呼叫人工客服解冻", 
            onPress: () => {
              showAlert(
                "📞 正在接通", 
                "正在为您转接反诈专属人工客服...", 
                [{ 
                  text: "OK", 
                  onPress: () => {
                    onUnfreeze(); // 调用父组件解除冻结
                    showAlert("✅ 解冻成功", "人工客服已为您核实身份，账户已恢复正常使用。");
                  } 
                }]
              );
            } 
          }
        ]
      );
    }

    if (!payee || !cardNo || !amount) return showAlert("提示", "请填写完整的户名、账号和转账金额");
    if (cardNo.length < 8) return showAlert("提示", "账号位数不正确，请输入 8 位以上测试账号");

    setLoading(true);
    try {
      const isLargeAmount = parseFloat(amount) > 5000;
      const isMissingNote = !note;
      const combinedText = `收款人户名：${payee}，收款账号：${cardNo}，转账金额：${amount}元，转账附言：${note || '无'}`;
      const data = await detectFraudApi(combinedText);
      
      let finalResult = { ...data };
      if (isLargeAmount || isMissingNote) {
        if (finalResult.risk_level !== 'high') {
          const aiSuggestion = finalResult.suggestion;
          const aiRiskLevel = finalResult.risk_level;
          finalResult.risk_level = 'medium';
          finalResult.scam_type = '行为风控异常';
          let reasons = [];
          if (isLargeAmount) reasons.push('大额');
          if (isMissingNote) reasons.push('无附言');
          const frontendReason = `检测到${reasons.join('且')}转账，存在潜在风险。`;
          finalResult.suggestion = aiRiskLevel === 'medium' ? `${frontendReason} 此外，管家研判发现：${aiSuggestion}` : `${frontendReason} 系统对附言分析为低风险，但仍请您务必核实收款人身份。`;
        }
      }
      if (finalResult.risk_level === 'low' && (!finalResult.scam_type || finalResult.scam_type === '无')) finalResult.scam_type = '低风险';
      
      setResultData(finalResult);
      triggerHaptic(finalResult.risk_level as 'high' | 'medium' | 'low');
      setModalVisible(true);
    } catch (error) {
      showAlert("网络错误", "无法连接到后端服务，请检查网络后重试。");
    } finally {
      setLoading(false);
    }
  };

  const executeTransfer = async (isForced: boolean) => {
    setModalVisible(false);
    addTransaction({ id: Date.now(), title: `转账 - ${payee}`, time: getFormattedTime(), amount: `- ¥ ${parseFloat(amount).toFixed(2)}`, isExpense: true, isAbnormal: false, isRisk: resultData?.risk_level });
    if (isForced) {
      if (resultData?.risk_level === 'high') {
        await alertFamilyApi(note || '无附言', resultData.scam_type, userPhone);
        showAlert("✅ 转账成功", "款项已汇出。系统已向您的紧急联系人【辛先生】发送了高危预警短信和邮件，请注意资金安全。");
      } else {
        showAlert("✅ 转账成功", "款项已汇出。系统已记录此笔可疑交易。");
      }
    } else {
      showAlert("✅ 转账成功", "交易已安全完成，请注意查收。");
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPayee(''); setCardNo(''); setAmount(''); setNote('');
  };

  const handleCancelTransfer = async () => {
    setModalVisible(false);
    onFreeze();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    addTransaction({ id: Date.now(), title: `转账 - ${payee}`, time: getFormattedTime(), amount: `- ¥ ${parseFloat(amount).toFixed(2)}`, isExpense: true, isAbnormal: true });
    
    if (resultData?.risk_level === 'high') {
      await alertFamilyApi(note || '无附言', resultData.scam_type, userPhone);
      showAlert(
        "🛡️ 资金已进入保护状态", 
        "系统已为您阻断交易。同时，已自动向您的紧急联系人【辛先生】发送了拦截通知。如需解冻，请呼叫人工客服核实身份。", 
        [
          { text: "稍后处理", style: "cancel" },
          { 
            text: "📞 呼叫人工客服申诉解冻", 
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
    } else {
      showAlert("🛡️ 交易已阻断", "资金已保护，并未转出。已为您记录风险。");
    }
    setPayee(''); setCardNo(''); setAmount(''); setNote('');
  };

  const getModalStyle = () => {
    if (resultData?.risk_level === 'high') return { bg: '#D32F2F', text: 'white', icon: '🚨', title: '高度风险警告', btn1: '无视风险强制转账', btn2: '阻断交易并保护性冻结资金', btn2Bg: '#B71C1C' };
    if (resultData?.risk_level === 'medium') return { bg: '#FFC107', text: '#333', icon: '⚠️', title: '可疑交易提醒', btn1: '无视提醒继续转账', btn2: '暂停转账，核实身份', btn2Bg: '#F57F17' };
    return { bg: '#2E7D32', text: 'white', icon: '✅', title: '交易环境安全', btn1: '', btn2: '', btn2Bg: '' };
  };
  const theme = getModalStyle();

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView 
          ref={scrollViewRef} 
          contentContainerStyle={styles.container} 
          showsVerticalScrollIndicator={false} 
          keyboardDismissMode="on-drag" 
          keyboardShouldPersistTaps="handled"
        >
          
          <Text style={styles.pageTitle} accessibilityRole="header">账号转账</Text>
          <Text style={styles.pageSubtitle}>智能风控引擎，守护您的每一笔资金</Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>收款人户名</Text>
            <TextInput 
              style={styles.input} 
              placeholder="收款人户名/企业账户名" 
              placeholderTextColor="#767676" 
              value={payee} 
              onChangeText={setPayee} 
              accessibilityLabel="收款人户名输入框"
            />

            <Text style={styles.label}>收款人账号</Text>
            <TextInput 
              style={styles.input} 
              placeholder="银行卡号/信用卡号/企业账号" 
              placeholderTextColor="#767676" 
              keyboardType="number-pad" 
              maxLength={19} 
              value={cardNo} 
              onChangeText={setCardNo} 
              accessibilityLabel="收款人银行卡号输入框"
            />
            
            {bankInfo ? (
              <Text style={styles.bankInfoText} accessibilityLiveRegion="polite">🏦 {bankInfo}</Text>
            ) : (
              <View style={{ height: 15 }} />
            )}

            <Text style={[styles.label, { fontSize: 26, marginTop: 25 }]}>转账金额</Text>
            <View style={styles.amountWrapper}>
              <Text style={styles.currencySymbol}>¥</Text>
              <TextInput 
                style={styles.amountInput} 
                placeholder="0.00" 
                placeholderTextColor="#767676" 
                keyboardType="decimal-pad" 
                value={amount} 
                onChangeText={setAmount} 
                accessibilityLabel="转账金额输入框"
              />
            </View>

            <Text style={styles.label}>转账附言</Text>
            <TextInput 
              style={styles.textArea} 
              placeholder="选填。可填写转账目的、备忘信息等。若对方要求你转账，可填入对方的目的或话术。" 
              placeholderTextColor="#767676" 
              multiline 
              textAlignVertical="top" 
              value={note} 
              onChangeText={setNote} 
              accessibilityLabel="转账附言输入框，选填"
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 250);
              }}
            />
          </View>

          <Pressable style={[styles.actionBtn, loading && { opacity: 0.7 }]} onPress={checkFraud} disabled={loading} accessibilityRole="button" accessibilityLabel="确认转账并进行安全检测" accessibilityState={{ disabled: loading, busy: loading }}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>确认转账并进行安全检测</Text>}
          </Pressable>

          <Text style={styles.securityTip}>
            🔒 本笔转账受智能反诈管家实时风控保护，如遇诈骗请立即挂断并拨打 <Text style={{ color: '#D32F2F', fontWeight: 'bold' }}>96110</Text>。
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay} accessibilityViewIsModal={true}>
          <View style={[styles.modalContent, { backgroundColor: theme.bg }]} accessibilityLiveRegion="assertive">
            
            <Text style={styles.modalIcon} accessible={false}>{theme.icon}</Text>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{theme.title}</Text>
            
            <View style={styles.modalInfoBox}>
              <Text style={[styles.modalLabel, { color: theme.text }]}>风险类型：</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>{resultData?.scam_type}</Text>
            </View>
            
            <View style={styles.modalInfoBox}>
              <Text style={[styles.modalLabel, { color: theme.text }]}>管家建议：</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>{resultData?.suggestion}</Text>
            </View>

            <View style={styles.modalButtons}>
              {resultData?.risk_level === 'high' || resultData?.risk_level === 'medium' ? (
                <>
                  <Pressable style={[styles.modalBtn, { backgroundColor: 'rgba(0,0,0,0.15)' }]} onPress={() => executeTransfer(true)} accessibilityRole="button" accessibilityLabel={theme.btn1} accessibilityHint="警告：这可能导致资金损失">
                    <Text style={[styles.btnText, { color: theme.text }]}>{theme.btn1}</Text>
                  </Pressable>
                  <Pressable style={[styles.modalBtn, { backgroundColor: theme.btn2Bg }]} onPress={handleCancelTransfer} accessibilityRole="button" accessibilityLabel={theme.btn2}>
                    <Text style={[styles.btnText, { color: 'white' }]}>{theme.btn2}</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable style={[styles.modalBtn, { backgroundColor: '#1B8A2E' }]} onPress={() => executeTransfer(false)} accessibilityRole="button" accessibilityLabel="确认安全转账">
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' }}>确认转账</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>

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
  container: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 10 },
  pageSubtitle: { fontSize: 18, color: '#666', marginBottom: 25 },
  formCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2 },
  
  label: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 15 },
  
  input: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 14, fontSize: 22, marginBottom: 5, color: '#333', minHeight: 50 },
  bankInfoText: { fontSize: 16, color: '#2E7D32', fontWeight: 'bold', marginBottom: 10 },
  
  amountWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 10, paddingVertical: 12, minHeight: 65 },
  currencySymbol: { fontSize: 32, fontWeight: 'bold', marginRight: 10, color: '#333' },
  amountInput: { fontSize: 42, fontWeight: 'bold', flex: 1, color: '#333' },
  
  textArea: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 15, fontSize: 22, minHeight: 120, marginBottom: 10, backgroundColor: '#fafafa', color: '#333' },
  
  actionBtn: { backgroundColor: '#D32F2F', padding: 22, borderRadius: 12, alignItems: 'center', marginBottom: 15, minHeight: 60 },
  buttonText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  securityTip: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 24 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 10 },
  modalIcon: { fontSize: 70, marginBottom: 15 },
  modalTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 25 },
  modalInfoBox: { flexDirection: 'row', marginBottom: 16, width: '100%', alignItems: 'flex-start' },
  modalLabel: { fontSize: 20, fontWeight: 'bold', width: 100, lineHeight: 34, marginTop: 2 }, 
  modalValue: { fontSize: 20, fontWeight: 'bold', flex: 1, lineHeight: 34 },
  modalButtons: { flexDirection: 'column', gap: 12, marginTop: 25, width: '100%' },
  modalBtn: { paddingVertical: 20, borderRadius: 12, alignItems: 'center', minHeight: 65 },
  btnText: { fontSize: 22, fontWeight: 'bold' },
});
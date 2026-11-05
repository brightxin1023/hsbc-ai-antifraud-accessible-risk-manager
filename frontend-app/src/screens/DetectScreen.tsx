import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { detectFraudApi, alertFamilyApi } from '../services/api'; 

export default function DetectScreen({ onFreeze }: { onFreeze: () => void }) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 控制自定义弹窗的状态
  const [modalVisible, setModalVisible] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const checkFraud = async () => {
    if (!inputText) return Alert.alert("提示", "请输入可疑信息");
    setLoading(true);
    try {
      const data = await detectFraudApi(inputText);
      setResultData(data);
      
      if (data.risk_level === 'high') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else if (data.risk_level === 'medium') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      
      // 不管什么级别，都打开自定义弹窗
      setModalVisible(true);
    } catch (error) {
      Alert.alert("网络错误", "无法连接到后端");
    } finally {
      setLoading(false);
    }
  };

  const handleFreeze = async () => {
    onFreeze();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setModalVisible(false); 
    
    if (resultData) {
      await alertFamilyApi(inputText, resultData.scam_type);
    }
    
    Alert.alert("🛡️ 已冻结", "资金已保护，已自动发送预警邮件通知您的家属。");
  };

  // 动态获取弹窗的样式和图标
  const getModalStyle = () => {
    if (resultData?.risk_level === 'high') {
      return { bg: '#D32F2F', text: 'white', icon: '🚨', title: '高危诈骗拦截' };
    } else if (resultData?.risk_level === 'medium') {
      return { bg: '#FFC107', text: '#333', icon: '⚠️', title: '疑似诈骗提醒' };
    } else {
      return { bg: '#2E7D32', text: 'white', icon: '✅', title: '交易安全' };
    }
  };

  const theme = getModalStyle();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>AI 异常交易检测</Text>
      <TextInput 
        style={styles.input} 
        placeholder="请粘贴可疑聊天记录或转账附言" 
        multiline 
        value={inputText} 
        onChangeText={setInputText} 
      />
      <Pressable style={styles.actionBtn} onPress={checkFraud} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>开始 AI 检测</Text>}
      </Pressable>

      {/* 多模态高对比度自定义弹窗 */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.bg }]}>
            
            <Text style={styles.modalIcon}>{theme.icon}</Text>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{theme.title}</Text>
            
            <View style={styles.modalInfoBox}>
              <Text style={[styles.modalLabel, { color: theme.text }]}>识别类型：</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>{resultData?.scam_type}</Text>
            </View>
            <View style={styles.modalInfoBox}>
              <Text style={[styles.modalLabel, { color: theme.text }]}>建议操作：</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>{resultData?.suggestion}</Text>
            </View>

            {resultData?.risk_level === 'high' && (
              <Text style={[styles.modalPrompt, { color: theme.text }]}>是否立刻冻结账户并阻断交易？</Text>
            )}

            <View style={styles.modalButtons}>
              {resultData?.risk_level === 'high' ? (
                <>
                  <Pressable style={[styles.modalBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]} onPress={() => setModalVisible(false)}>
                    <Text style={[styles.btnText, { color: theme.text }]}>取消</Text>
                  </Pressable>
                  <Pressable style={[styles.modalBtn, { backgroundColor: '#B71C1C' }]} onPress={handleFreeze}>
                    <Text style={[styles.btnText, { color: 'white' }]}>一键冻结</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable style={[styles.modalBtn, { backgroundColor: 'rgba(0,0,0,0.2)', flex: 1 }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.btnText, { color: theme.text }]}>我知道了</Text>
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
  container: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 15, fontSize: 18, height: 120, textAlignVertical: 'top', marginBottom: 20 },
  actionBtn: { backgroundColor: '#D32F2F', padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  
  // 弹窗样式
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  modalIcon: { fontSize: 60, marginBottom: 10 },
  modalTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  modalInfoBox: { flexDirection: 'row', marginBottom: 12, width: '100%', alignItems: 'flex-start' },
  modalLabel: { fontSize: 20, fontWeight: 'bold', width: 100 },
  modalValue: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  modalPrompt: { fontSize: 20, textAlign: 'center', marginVertical: 20, fontWeight: 'bold' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, width: '100%', gap: 10 },
  modalBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { fontSize: 20, fontWeight: 'bold' },
});
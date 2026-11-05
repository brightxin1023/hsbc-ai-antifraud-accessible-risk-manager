import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { detectFraudApi, alertFamilyApi } from '../services/api'; 

export default function DetectScreen({ onFreeze }: { onFreeze: () => void }) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const checkFraud = async () => {
    if (!inputText) return Alert.alert("提示", "请输入可疑信息");
    setLoading(true);
    try {
      const data = await detectFraudApi(inputText);
      
      if (data.risk_level === 'high') {
        // 修改1：去掉 await，加上 .catch(() => {}) 防止浏览器报错阻断流程
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        
        Alert.alert(
          "⚠️ 高危诈骗拦截", 
          `识别类型：${data.scam_type}\n建议操作：${data.suggestion}\n\n是否立刻冻结账户？`,
          [
            { text: "取消", style: "cancel" },
            { 
              text: "一键冻结", 
              style: "destructive", 
              onPress: async () => {
                onFreeze(); 
                // 修改2：同样加上防报错
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
                
                await alertFamilyApi(inputText, data.scam_type);
                
                Alert.alert("🛡️ 已冻结", "资金已保护，已自动发送预警邮件通知您的家属。");
              }
            }
          ]
        );
      } else {
        // 修改3：同样加上防报错
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        Alert.alert("✅ 交易安全", "未发现明显诈骗特征");
      }
    } catch (error) {
      Alert.alert("网络错误", "无法连接到后端");
    } finally {
      setLoading(false);
    }
  };

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 15, fontSize: 18, height: 120, textAlignVertical: 'top', marginBottom: 20 },
  actionBtn: { backgroundColor: '#D32F2F', padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});
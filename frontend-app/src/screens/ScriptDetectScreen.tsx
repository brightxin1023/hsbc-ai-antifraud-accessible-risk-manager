import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import { detectFraudApi } from '../services/api';

export default function ScriptDetectScreen() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkScript = async () => {
    Keyboard.dismiss();
    if (!inputText.trim()) return Alert.alert("提示", "请粘贴您收到的可疑短信或聊天记录");

    setLoading(true);
    try {
      // 直接复用后端的 detect 接口进行 NLP 语义风控
      const data = await detectFraudApi(inputText);
      
      let riskLevel = data.risk_level;
      let scamType = data.scam_type;
      
      if (riskLevel === 'low' && (!scamType || scamType === '无')) {
        scamType = '未发现明显诈骗特征';
      }

      setResult({ ...data, scam_type: scamType });
      
      // 震动反馈
      if (riskLevel === 'high') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else if (riskLevel === 'medium') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

    } catch (error) {
      Alert.alert("网络错误", "无法连接到后端 AI 服务");
    } finally {
      setLoading(false);
    }
  };

  const getResultStyle = () => {
    if (!result) return { bg: '#fff', text: '#333', icon: '' };
    if (result.risk_level === 'high') return { bg: '#FFEBEE', text: '#D32F2F', icon: '🚨', title: '高度风险（判定为涉诈剧本）' };
    if (result.risk_level === 'medium') return { bg: '#FFF8E1', text: '#F57F17', icon: '⚠️', title: '可疑特征（建议谨慎核实）' };
    return { bg: '#E8F5E9', text: '#2E7D32', icon: '✅', title: '暂未发现明显风险' };
  };

  const theme = getResultStyle();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerBox}>
            <Text style={styles.pageTitle}>📩 涉诈剧本扫描</Text>
            <Text style={styles.description}>
              收到奇怪的短信、微信或电话录音转写？请直接粘贴到这里。AI 将进行端侧风险分级研判，帮您识破骗局。
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="请粘贴可疑文本，例如：我是公安局的，你的卡涉嫌洗钱..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            value={inputText}
            onChangeText={setInputText}
          />

          <Pressable style={[styles.actionBtn, loading && { opacity: 0.7 }]} onPress={checkScript} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>开始 AI 剧本扫描</Text>}
          </Pressable>

          {result && (
            <View style={[styles.resultCard, { backgroundColor: theme.bg, borderColor: theme.bg }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ fontSize: 28, marginRight: 10 }}>{theme.icon}</Text>
                <Text style={[styles.resultTitle, { color: theme.text }]}>{theme.title}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.resultLabel, { color: theme.text }]}>识别类型：</Text>
                <Text style={[styles.resultValue, { color: theme.text }]}>{result.scam_type}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.resultLabel, { color: theme.text }]}>AI 建议：</Text>
                <Text style={[styles.resultValue, { color: theme.text }]}>{result.suggestion}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { padding: 20 },
  headerBox: { marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  description: { fontSize: 15, color: '#666', lineHeight: 22 },
  input: { backgroundColor: 'white', borderRadius: 12, padding: 15, fontSize: 16, height: 180, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  actionBtn: { backgroundColor: '#1976D2', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 25 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  resultCard: { padding: 20, borderRadius: 12, borderWidth: 2, elevation: 2 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, lineHeight: 26 },
  infoRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  resultLabel: { fontSize: 15, fontWeight: 'bold', width: 85, lineHeight: 24 },
  resultValue: { fontSize: 15, fontWeight: 'bold', flex: 1, lineHeight: 24 },
});
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

// 注：黑客松现场演示模式，通过手机热点局域网直连本地 FastAPI 后端，确保极速响应。
// 生产环境部署时，应替换为云服务器（如 AWS/阿里云）的正式域名地址。
const API_URL = 'http://172.20.10.3:8000/api/detect';

  const checkFraud = async () => {
    if (!inputText) {
      Alert.alert("提示", "请输入转账附言或对方发来的信息");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      
      if (data.risk_level === 'high') {
        // 触发高危震动
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        // 弹出无障碍大字警告
        Alert.alert(
          "⚠️ 高危诈骗拦截", 
          `识别类型：${data.scam_type}\n建议操作：${data.suggestion}`
        );
      } else {
        // 安全提示
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert("✅ 交易安全", "未发现明显诈骗特征");
      }
    } catch (error) {
      Alert.alert("网络错误", "无法连接到后端 AI 服务，请检查电脑 IP 和 Wi-Fi。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI 反诈盾及无障碍风险管家</Text>
      
      <TextInput
        style={styles.input}
        placeholder="请粘贴可疑聊天记录或转账附言"
        placeholderTextColor="#666"
        multiline
        value={inputText}
        onChangeText={setInputText}
        accessibilityLabel="输入可疑信息"
      />

      <Pressable 
        style={[styles.button, loading && { backgroundColor: '#999' }]} 
        onPress={checkFraud}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="点击进行AI反诈检测"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>开始 AI 检测</Text>
        )}
      </Pressable>

      <Text style={styles.testHint}>
        测试样例：{"\n"}“我是公安局的，你的卡涉嫌洗钱，请把钱转入安全账户”
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#333' },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 15, fontSize: 18, height: 120, textAlignVertical: 'top', marginBottom: 20, borderWidth: 1, borderColor: '#ccc' },
  button: { backgroundColor: '#D32F2F', padding: 18, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  testHint: { fontSize: 14, color: '#666', textAlign: 'center', fontStyle: 'italic' }
});
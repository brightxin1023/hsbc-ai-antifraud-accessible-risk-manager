import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, ScrollView, Platform, Keyboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import { detectFraudApi } from '../services/api';
import CustomAlert from '../components/CustomAlert';

/**
 * 涉诈剧本扫描：把用户粘贴的可疑短信/聊天记录交给 AI 研判并展示分级结果。
 *
 * 结果卡片用 accessibilityLiveRegion="assertive" 主动播报，并叠加分级 Haptics，
 * 保证视障用户无需手动定位也能第一时间感知风险等级。
 *
 * @param onBack 可选返回回调；由工具箱内部渲染时传入，独立使用时可不传。
 */
export default function ScriptDetectScreen({ onBack }: any) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 结果渲染后需自动滚动到底部，先持有 ScrollView 引用
  const scrollViewRef = useRef<any>(null);

  const [alertConfig, setAlertConfig] = useState<any>({ visible: false });
  const showAlert = (title: string, message: string, buttons: any[] = [{ text: 'OK' }]) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const checkScript = async () => {
    Keyboard.dismiss();
    if (!inputText.trim()) return showAlert("提示", "请粘贴您收到的可疑短信或聊天记录");
    setLoading(true);
    try {
      const data = await detectFraudApi(inputText);
      let riskLevel = data.risk_level;
      let scamType = data.scam_type;
      if (riskLevel === 'low' && (!scamType || scamType === '无')) scamType = '未发现明显诈骗特征';
      setResult({ ...data, scam_type: scamType });
      
      if (riskLevel === 'high') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      else if (riskLevel === 'medium') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      // 关键优化：结果出来后，延迟 100ms 自动平滑滚动到底部，展示完整结果
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      showAlert("网络错误", "无法连接到后端 AI 服务");
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
    <View style={{ flex: 1 }}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="返回工具箱">
            <Text style={styles.backBtnText}>← 返回工具箱</Text>
          </Pressable>
        ) : null}
        
        <View style={styles.headerBox}>
          <Text style={styles.pageTitle} accessibilityRole="header">📩 涉诈剧本扫描</Text>
          <Text style={styles.description}>收到奇怪的短信、微信或电话录音转写？请直接粘贴到这里。智能风控系统将进行端侧风险分级研判，帮您识破骗局。</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="请粘贴可疑文本，例如：我是公安局的，你的卡涉嫌洗钱..."
          placeholderTextColor="#767676"
          multiline
          textAlignVertical="top"
          value={inputText}
          onChangeText={setInputText}
          accessibilityLabel="粘贴可疑文本输入框"
        />

        <Pressable style={[styles.actionBtn, loading && { opacity: 0.7 }]} onPress={checkScript} disabled={loading} accessibilityRole="button" accessibilityLabel="一键智能研判" accessibilityState={{ disabled: loading, busy: loading }}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>一键智能研判</Text>}
        </Pressable>

        {result && (
          <View style={[styles.resultCard, { backgroundColor: theme.bg, borderColor: theme.bg }]} accessible={true} accessibilityLiveRegion="assertive" accessibilityLabel={`扫描结果：${theme.title}。识别类型：${result.scam_type}。管家建议：${result.suggestion}`}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Text style={{ fontSize: 32, marginRight: 10 }} accessible={false}>{theme.icon}</Text>
              <Text style={[styles.resultTitle, { color: theme.text }]}>{theme.title}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.resultLabel, { color: theme.text }]}>识别类型：</Text>
              <Text style={[styles.resultValue, { color: theme.text }]}>{result.scam_type}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.resultLabel, { color: theme.text }]}>管家建议：</Text>
              <Text style={[styles.resultValue, { color: theme.text }]}>{result.suggestion}</Text>
            </View>
          </View>
        )}
      </ScrollView>

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
  // 增加底部留白，保证内容绝对不被底部的 Tab 栏遮挡
  scrollContent: { padding: 20, paddingBottom: 120 }, 
  headerBox: { marginBottom: 20 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  description: { fontSize: 18, color: '#666', lineHeight: 28 },
  // 适当缩减输入框最小高度，让页面比例更均衡
  input: { backgroundColor: 'white', borderRadius: 12, padding: 18, fontSize: 20, minHeight: 160, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  actionBtn: { backgroundColor: '#1565C0', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 25, minHeight: 60 },
  buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  resultCard: { padding: 20, borderRadius: 12, borderWidth: 2, elevation: 2 },
  resultTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, lineHeight: 28 },
  infoRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  resultLabel: { fontSize: 18, fontWeight: 'bold', width: 95, lineHeight: 26 },
  resultValue: { fontSize: 18, fontWeight: 'bold', flex: 1, lineHeight: 28 },
  backBtn: { paddingVertical: 6, paddingRight: 12, minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', marginBottom: 12 },
  backBtnText: { fontSize: 20, color: '#1565C0', fontWeight: 'bold' },
});
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, FlatList, Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import { askQuestionApi } from '../services/api';
import CustomAlert from '../components/CustomAlert';

interface Message { id: string; role: 'user' | 'ai'; content: string; }

const BOTTOM_NAV_HEIGHT = 80;

export default function QAScreen({ onBack }: any) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'ai', content: '您好！我是您的专属智能反诈助手。您可以问我任何拿不准的转账、短信或电话情况，我将基于最新诈骗话术库为您解答。' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef<any>(null);

  const [alertConfig, setAlertConfig] = useState<any>({ visible: false });
  const showAlert = (title: string, message: string, buttons: any[] = [{ text: 'OK' }]) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, 300);
    return () => clearTimeout(timer);
  }, [messages, loading, keyboardHeight]); 

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setTimeout(async () => {
        await recorder.stop();
        setIsRecording(false);
        setInputText('刚才有人打电话说我的医保卡停用了，让我点链接验证，这是真的吗？');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isRecording]);

  const handleVoiceInput = async () => {
    Keyboard.dismiss();
    if (loading) return;
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) return showAlert("权限被拒绝", "请在设置中允许麦克风权限");
      
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      
      setIsRecording(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } catch (err) {
      showAlert("错误", "麦克风启动失败");
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;
    Keyboard.dismiss(); 

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputText };
    setMessages(prev => [...prev, userMsg]);
    const currentQuery = inputText;
    setInputText('');
    setLoading(true);

    try {
      const data = await askQuestionApi(currentQuery);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: data.answer };
      setMessages(prev => [...prev, aiMsg]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch (error) {
      showAlert("网络错误", "无法连接到智能服务，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.role === 'user' ? styles.msgRowUser : styles.msgRowAi]}>
      {item.role === 'ai' && <Text style={styles.avatar} accessible={false}>🛡️</Text>}
      <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAi]} accessible={true} accessibilityLabel={item.role === 'user' ? `我说：${item.content}` : `智能反诈助手说：${item.content}`}>
        <Text style={item.role === 'user' ? styles.textUser : styles.textAi}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {onBack ? (
        <View style={styles.backBar}>
          <Pressable onPress={onBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="返回工具箱">
            <Text style={styles.backBtnText}>← 返回工具箱</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.header}>
        <Text style={styles.headerTitle} accessibilityRole="header">反诈智能问答</Text>
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>反诈智库 · 权威答案</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={{ flex: 1 }}
        contentContainerStyle={styles.chatArea}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={loading ? (
          <View style={[styles.msgRow, styles.msgRowAi, { marginBottom: 10 }]} accessibilityLiveRegion="polite">
            <Text style={styles.avatar} accessible={false}>🛡️</Text>
            <View style={[styles.bubble, styles.bubbleAi, { flexDirection: 'row', alignItems: 'center' }]}>
              <ActivityIndicator size="small" color="#D32F2F" />
              <Text style={[styles.textAi, { marginLeft: 8 }]}>智能助手正在分析话术库...</Text>
            </View>
          </View>
        ) : undefined}
      />

      <View style={[styles.inputArea, { marginBottom: keyboardHeight > 0 ? keyboardHeight - (insets.bottom || 0) : 0, paddingBottom: keyboardHeight > 0 ? 10 : BOTTOM_NAV_HEIGHT + 10 }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={isRecording ? "正在聆听..." : "遇到不懂的套路？直接问智能反诈助手"}
            placeholderTextColor={isRecording ? "#D32F2F" : "#767676"}
            multiline
            value={inputText}
            onChangeText={setInputText}
            editable={!isRecording}
            blurOnSubmit={true}
            accessibilityLabel="输入你的反诈问题"
          />
          <Pressable style={[styles.voiceBtn, isRecording && { backgroundColor: '#FFEBEE' }]} onPress={handleVoiceInput} disabled={isRecording} accessibilityRole="button" accessibilityLabel={isRecording ? "正在录音中" : "语音输入"} accessibilityState={{ busy: isRecording }}>
            <Text style={{ fontSize: 28, marginTop: 2 }}>{isRecording ? '🔴' : '🎙️'}</Text>
          </Pressable>
          <Pressable style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} onPress={handleSend} disabled={!inputText.trim() || loading} accessibilityRole="button" accessibilityLabel="发送消息" accessibilityState={{ disabled: !inputText.trim() || loading }}>
            <Text style={styles.sendBtnText}>发送</Text>
          </Pressable>
        </View>
      </View>

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
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { paddingVertical: 15, backgroundColor: '#f0f2f5', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#ddd' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  tagContainer: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 8 },
  tagText: { fontSize: 16, color: '#1565C0', fontWeight: 'bold' },
  chatArea: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  msgRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAi: { justifyContent: 'flex-start' },
  avatar: { fontSize: 28, marginRight: 8, marginTop: 5 },
  bubble: { maxWidth: '80%', padding: 16, borderRadius: 16 },
  bubbleUser: { backgroundColor: '#D32F2F', borderBottomRightRadius: 4 },
  bubbleAi: { backgroundColor: 'white', borderBottomLeftRadius: 4, elevation: 1 },
  textUser: { color: 'white', fontSize: 18, lineHeight: 28 },
  textAi: { color: '#333', fontSize: 18, lineHeight: 28 },
  inputArea: { backgroundColor: 'white', paddingHorizontal: 15, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#ddd', borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 28, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, maxHeight: 120, minHeight: 56 },
  voiceBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sendBtn: { backgroundColor: '#D32F2F', borderRadius: 28, paddingHorizontal: 26, justifyContent: 'center', height: 56, marginLeft: 10 },
  sendBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  backBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f0f2f5' },
  backBtn: { paddingVertical: 6, paddingRight: 12, minHeight: 44, justifyContent: 'center' },
  backBtnText: { fontSize: 20, color: '#1565C0', fontWeight: 'bold' },
});
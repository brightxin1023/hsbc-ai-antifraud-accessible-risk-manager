import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, StyleSheet, FlatList, Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import { askQuestionApi } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function QAScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'ai', content: '您好！我是您的专属反诈 AI 助手。您可以问我任何拿不准的转账、短信或电话情况，我将基于最新诈骗话术库为您解答。' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef<any>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 300);
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
      if (!status.granted) return Alert.alert("权限被拒绝", "请在设置中允许麦克风权限");
      
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      
      setIsRecording(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } catch (err) {
      Alert.alert("错误", "麦克风启动失败");
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
      Alert.alert("网络错误", "无法连接到 AI 服务");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.role === 'user' ? styles.msgRowUser : styles.msgRowAi]}>
      {item.role === 'ai' && <Text style={styles.avatar} accessible={false}>🛡️</Text>}
      <View 
        style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}
        accessible={true}
        accessibilityLabel={item.role === 'user' ? `我说：${item.content}` : `AI助手说：${item.content}`}
      >
        <Text style={item.role === 'user' ? styles.textUser : styles.textAi}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} accessibilityRole="header">反诈智能问答</Text>
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>基于 RAG 话术库 · 精准防幻觉</Text>
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
          <View 
            style={[styles.msgRow, styles.msgRowAi, { marginBottom: 10 }]}
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.avatar} accessible={false}>🛡️</Text>
            <View style={[styles.bubble, styles.bubbleAi, { flexDirection: 'row', alignItems: 'center' }]}>
              <ActivityIndicator size="small" color="#D32F2F" />
              <Text style={[styles.textAi, { marginLeft: 8 }]}>AI 正在分析话术库...</Text>
            </View>
          </View>
        ) : undefined}
      />

      <View style={[
        styles.inputArea, 
        { 
          marginBottom: keyboardHeight > 0 ? keyboardHeight - insets.bottom : 0,
          paddingBottom: keyboardHeight > 0 ? 10 : (insets.bottom > 0 ? insets.bottom + 10 : 10)
        }
      ]}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={isRecording ? "🔴 正在聆听..." : "遇到不懂的套路？直接问 AI 助手"}
            placeholderTextColor={isRecording ? "#D32F2F" : "#999"}
            multiline
            value={inputText}
            onChangeText={setInputText}
            editable={!isRecording}
            blurOnSubmit={true}
            accessibilityLabel="输入你的反诈问题"
          />
          
          <Pressable 
            style={[styles.voiceBtn, isRecording && { backgroundColor: '#FFEBEE' }]} 
            onPress={handleVoiceInput} 
            disabled={isRecording}
            accessibilityRole="button"
            accessibilityLabel={isRecording ? "正在录音中" : "语音输入"}
            accessibilityState={{ busy: isRecording }}
          >
            <Text style={{ fontSize: 20 }}>{isRecording ? '🔴' : '🎙️'}</Text>
          </Pressable>

          <Pressable 
            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} 
            onPress={handleSend} 
            disabled={!inputText.trim() || loading}
            accessibilityRole="button"
            accessibilityLabel="发送消息"
            accessibilityState={{ disabled: !inputText.trim() || loading }}
          >
            <Text style={styles.sendBtnText}>发送</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { paddingVertical: 15, backgroundColor: '#f0f2f5', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#ddd' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  tagContainer: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  tagText: { fontSize: 16, color: '#1976D2', fontWeight: 'bold' },
  chatArea: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  msgRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAi: { justifyContent: 'flex-start' },
  avatar: { fontSize: 24, marginRight: 8, marginTop: 5 },
  bubble: { maxWidth: '80%', padding: 15, borderRadius: 16 },
  bubbleUser: { backgroundColor: '#D32F2F', borderBottomRightRadius: 4 },
  bubbleAi: { backgroundColor: 'white', borderBottomLeftRadius: 4, elevation: 1 },
  textUser: { color: 'white', fontSize: 17, lineHeight: 26 },
  textAi: { color: '#333', fontSize: 17, lineHeight: 26 },
  inputArea: { backgroundColor: 'white', paddingHorizontal: 15, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#ddd' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 12, fontSize: 17, maxHeight: 100, minHeight: 44 },
  voiceBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sendBtn: { backgroundColor: '#D32F2F', borderRadius: 20, paddingHorizontal: 18, justifyContent: 'center', height: 44, marginLeft: 10 },
  sendBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
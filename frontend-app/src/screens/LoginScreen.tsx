// src/screens/LoginScreen.tsx
import React from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const handleLogin = () => {
    Keyboard.dismiss(); // 登录时顺手收起键盘
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onLogin();
    Alert.alert("✅ 绑定成功", "已通过无障碍安全验证，绑定尾号 8888 储蓄卡。");
  };

  return (
    // 1. 用 TouchableWithoutFeedback 包裹，实现点击空白处收起键盘
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {/* 2. 用 KeyboardAvoidingView 防止键盘遮挡底部按钮 */}
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 3. 用 ScrollView 保证小屏幕手机也能滑动查看 */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title} accessibilityRole="header">欢迎使用 AI 反诈盾</Text>
          <Text style={styles.subtitle}>请绑定您的银行卡以开启保护</Text>
          
          <View style={styles.card}>
            <Text style={styles.label} accessibilityLabel="请输入手机号或卡号后四位">请输入手机号或卡号后四位</Text>
            <TextInput 
              style={styles.input} 
              placeholder="例如：8888" 
              keyboardType="number-pad" 
              accessibilityLabel="卡号输入框"
              maxLength={4}
            />
            <Text style={styles.label} accessibilityLabel="无障碍安全验证">无障碍安全验证（无需滑块或人脸）</Text>
            
            <Pressable style={styles.voiceBtn} onPress={() => Alert.alert("🎙️ 语音验证", "请跟读屏幕上的数字：3 8 5 1")} accessibilityLabel="点击进行语音跟读验证">
              <Text style={styles.voiceText}>🎙️ 语音跟读验证</Text>
            </Pressable>

            <Pressable style={styles.loginBtn} onPress={handleLogin} accessibilityRole="button" accessibilityLabel="一键安全登录并绑定">
              <Text style={styles.loginBtnText}>一键安全登录并绑定</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 }, // flexGrow:1 保证内容居中
  title: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 40 },
  card: { backgroundColor: 'white', padding: 25, borderRadius: 15, elevation: 3 },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  input: { borderWidth: 2, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 24, marginBottom: 25, textAlign: 'center', letterSpacing: 5 },
  voiceBtn: { backgroundColor: '#E3F2FD', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  voiceText: { color: '#1976D2', fontSize: 18, fontWeight: 'bold' },
  loginBtn: { backgroundColor: '#D32F2F', padding: 18, borderRadius: 10, alignItems: 'center' },
  loginBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { registerApi, loginApi } from '../services/api'; // 引入接口

export default function LoginScreen({ onLogin }: { onLogin: (phone: string) => void }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    Keyboard.dismiss();
    
    // 基础前端校验
    if (phone.length !== 11) return Alert.alert("提示", "请输入正确的 11 位手机号");
    if (password.length < 6) return Alert.alert("提示", "密码长度不能少于 6 位");
    if (!isLoginMode && password !== confirmPassword) return Alert.alert("提示", "两次输入的密码不一致");

    setLoading(true);
    
    if (!isLoginMode) {
      // ================= 注册模式 =================
      try {
        await registerApi(phone, password);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("✅ 注册成功", "请使用刚刚的密码进行登录", [
          { 
            text: "去登录", 
            onPress: () => { 
              setIsLoginMode(true); 
              setPassword(''); 
              setConfirmPassword(''); 
            } 
          }
        ]);
      } catch (error: any) {
        Alert.alert("注册失败", error.message);
      } finally {
        setLoading(false);
      }
    } else {
      // ================= 登录模式 =================
      try {
        await loginApi(phone, password);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onLogin(phone); // 成功，放行进入首页
      } catch (error: any) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        
        // 💡 智能引导逻辑：如果后端返回未注册，引导用户去注册
        if (error.message.includes("未注册")) {
          Alert.alert(
            "账号不存在", 
            "该手机号尚未注册，是否立即前往注册？",
            [
              { text: "取消", style: "cancel" },
              { 
                text: "去注册", 
                onPress: () => {
                  setIsLoginMode(false); // 切换到注册界面
                  setPassword('');       // 清空刚才输错的密码
                }
              }
            ]
          );
        } else {
          // 其他错误（如密码错误、网络问题等）
          Alert.alert("登录失败", error.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.title}>{isLoginMode ? '欢迎回来' : '创建新账户'}</Text>
          <Text style={styles.subtitle}>AI 反诈盾，守护您的资金安全</Text>

          <View style={styles.card}>
            <Text style={styles.label}>手机号</Text>
            <TextInput 
              style={styles.input} 
              placeholder="请输入 11 位手机号" 
              keyboardType="phone-pad" 
              maxLength={11} 
              value={phone} 
              onChangeText={setPhone} 
            />

            <Text style={styles.label}>密码</Text>
            <TextInput 
              style={styles.input} 
              placeholder="请输入 6-16 位密码" 
              secureTextEntry={true} 
              value={password} 
              onChangeText={setPassword} 
            />

            {!isLoginMode && (
              <>
                <Text style={styles.label}>确认密码</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="请再次输入密码" 
                  secureTextEntry={true} 
                  value={confirmPassword} 
                  onChangeText={setConfirmPassword} 
                />
              </>
            )}

            <Pressable 
              style={[styles.actionBtn, loading && { opacity: 0.7 }]} 
              onPress={handleAuth} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.actionBtnText}>
                  {isLoginMode ? '一键安全登录' : '立即注册并绑定'}
                </Text>
              )}
            </Pressable>

            <Pressable 
              style={styles.switchBtn} 
              onPress={() => setIsLoginMode(!isLoginMode)} 
              disabled={loading}
            >
              <Text style={styles.switchText}>
                {isLoginMode ? "还没有账户？去注册" : "已有账户？去登录"}
              </Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: 'white', padding: 25, borderRadius: 16, elevation: 4 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, fontSize: 18, marginBottom: 20, backgroundColor: '#fafafa' },
  actionBtn: { backgroundColor: '#D32F2F', padding: 18, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  actionBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  switchBtn: { alignItems: 'center', paddingVertical: 10 },
  switchText: { color: '#1976D2', fontSize: 16 }
});
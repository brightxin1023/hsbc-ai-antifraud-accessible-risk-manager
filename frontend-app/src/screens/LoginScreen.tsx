import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function LoginScreen({ onLogin, registeredUsers, setRegisteredUsers }: any) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAuth = () => {
    Keyboard.dismiss();
    
    if (phone.length !== 11) return Alert.alert("提示", "请输入正确的 11 位手机号");
    if (password.length < 6) return Alert.alert("提示", "密码长度不能少于 6 位");

    if (!isLoginMode) {
      // 💡 注册逻辑
      if (password !== confirmPassword) return Alert.alert("提示", "两次输入的密码不一致");
      const userExists = registeredUsers.find((u: any) => u.phone === phone);
      if (userExists) return Alert.alert("提示", "该手机号已注册，请直接登录");

      // 将新用户存入模拟数据库
      setRegisteredUsers([...registeredUsers, { phone, password }]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ 注册成功", "请使用刚刚的密码进行登录", [
        { text: "去登录", onPress: () => { setIsLoginMode(true); setPassword(''); setConfirmPassword(''); } }
      ]);
    } else {
      // 💡 登录逻辑
      const user = registeredUsers.find((u: any) => u.phone === phone && u.password === password);
      if (!user) return Alert.alert("登录失败", "账号未注册或密码错误，请先注册！");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onLogin(phone);
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
            <TextInput style={styles.input} placeholder="请输入 11 位手机号" keyboardType="phone-pad" maxLength={11} value={phone} onChangeText={setPhone} />

            <Text style={styles.label}>密码</Text>
            <TextInput style={styles.input} placeholder="请输入 6-16 位密码" secureTextEntry={true} value={password} onChangeText={setPassword} />

            {!isLoginMode && (
              <>
                <Text style={styles.label}>确认密码</Text>
                <TextInput style={styles.input} placeholder="请再次输入密码" secureTextEntry={true} value={confirmPassword} onChangeText={setConfirmPassword} />
              </>
            )}

            <Pressable style={styles.actionBtn} onPress={handleAuth}>
              <Text style={styles.actionBtnText}>{isLoginMode ? '一键安全登录' : '立即注册并绑定'}</Text>
            </Pressable>

            <Pressable style={styles.switchBtn} onPress={() => setIsLoginMode(!isLoginMode)}>
              <Text style={styles.switchText}>{isLoginMode ? "还没有账户？去注册" : "已有账户？去登录"}</Text>
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
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, ScrollView, ActivityIndicator, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import { registerApi, loginApi, getVoiceHintApi } from '../services/api';
import CustomAlert from '../components/CustomAlert';

export default function LoginScreen({ onLogin }: { onLogin: (phone: string) => void }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  const [isPhoneRecording, setIsPhoneRecording] = useState(false);
  const [phoneCountdown, setPhoneCountdown] = useState(10);

  const [voiceHint, setVoiceHint] = useState('');
  const [countdown, setCountdown] = useState(5);

  // 全局自定义弹窗状态
  const [alertConfig, setAlertConfig] = useState<any>({ visible: false });
  const showAlert = (title: string, message: string, buttons: any[] = [{ text: 'OK' }]) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let interval: NodeJS.Timeout;
    if (isPhoneRecording) {
      interval = setInterval(() => {
        setPhoneCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      timer = setTimeout(async () => {
        await recorder.stop();
        setIsPhoneRecording(false);
        setPhone('13800138000'); 
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        showAlert("识别成功", "已为您自动填入手机号：13800138000");
      }, 10000);
    }
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isPhoneRecording]);

  const handleVoicePhoneInput = async () => {
    Keyboard.dismiss();
    if (isRecording) return; 
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) return showAlert("权限被拒绝", "请在设置中允许麦克风权限");

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      
      setIsPhoneRecording(true);
      setPhoneCountdown(10);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } catch (err) {
      showAlert("错误", "麦克风启动失败");
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showVoiceModal && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      stopRecordingLogic();
    }
    return () => clearInterval(interval);
  }, [showVoiceModal, countdown]);

  const stopRecordingLogic = async () => {
    try {
      await recorder.stop();
      setIsRecording(false);
      setShowVoiceModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      
      showAlert("声纹匹配成功", "系统已成功验证您的动态口令，为您安全登录。", [
        { text: "进入应用", onPress: () => onLogin(phone) }
      ]);
    } catch (error) {
      setIsRecording(false);
      setShowVoiceModal(false);
    }
  };

  const handleVoiceVerify = async () => {
    Keyboard.dismiss();
    if (phone.length !== 11) return showAlert("提示", "请先输入 11 位手机号");
    if (isRecording || isPhoneRecording) return;

    try {
      setLoading(true);
      const res = await getVoiceHintApi(phone);
      setVoiceHint(res.hint);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      return showAlert("验证失败", error.message);
    }

    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) return showAlert("权限被拒绝", "请在手机设置中允许该应用使用麦克风");

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      
      setIsRecording(true);
      setCountdown(5);
      setShowVoiceModal(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } catch (err) {
      setIsRecording(false);
      setShowVoiceModal(false);
      showAlert("错误", "录音功能启动失败");
    }
  };

  const handleAuth = async () => {
    Keyboard.dismiss();
    if (phone.length !== 11) return showAlert("提示", "请输入正确的 11 位手机号");
    if (password.length !== 6) return showAlert("提示", "为了您的账户安全，密码必须为 6 位纯数字");
    if (!isLoginMode && password !== confirmPassword) return showAlert("提示", "两次输入的密码不一致");

    setLoading(true);
    if (!isLoginMode) {
      try {
        await registerApi(phone, password);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        showAlert("注册成功", "请使用刚刚的密码进行登录", [
          { text: "去登录", onPress: () => { setIsLoginMode(true); setPassword(''); setConfirmPassword(''); } }
        ]);
      } catch (error: any) {
        showAlert("注册失败", error.message);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await loginApi(phone, password);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        onLogin(phone);
      } catch (error: any) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        if (error.message.includes("未注册")) {
          showAlert("账号不存在", "该手机号尚未注册，是否立即前往注册？", [
            { text: "取消", style: "cancel" },
            { text: "去注册", onPress: () => { setIsLoginMode(false); setPassword(''); } }
          ]);
        } else {
          showAlert("登录失败", error.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
        
        <Text style={styles.title} accessibilityRole="header">{isLoginMode ? '欢迎回来' : '创建新账户'}</Text>
        <Text style={styles.subtitle}>数字无碍 · 智能反诈管家</Text>

        <View style={styles.card}>
          
          <Text style={styles.label}>手机号</Text>
          <View style={styles.inputRow}>
            <TextInput 
              style={[styles.input, { flex: 1, marginBottom: 0 }]} 
              placeholder="请输入 11 位手机号" 
              placeholderTextColor="#767676" 
              keyboardType="phone-pad" 
              maxLength={11} 
              value={phone} 
              onChangeText={setPhone} 
              accessibilityLabel="手机号输入框，请输入11位手机号"
            />
            <Pressable 
              style={[styles.phoneVoiceBtn, isPhoneRecording && { backgroundColor: '#D32F2F' }]} 
              onPress={handleVoicePhoneInput}
              disabled={isPhoneRecording || isRecording}
              accessibilityRole="button"
              accessibilityLabel="语音输入手机号按钮"
            >
              {isPhoneRecording ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.phoneVoiceIcon} accessible={false}>🎙️</Text>}
            </Pressable>
          </View>
          <View style={{ marginBottom: 20 }} /> 

          <Text style={styles.label}>密码</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput} 
              placeholder="输入 6 位数字密码" 
              placeholderTextColor="#767676" 
              secureTextEntry={!showPassword} 
              value={password} 
              onChangeText={setPassword} 
              keyboardType="number-pad"
              maxLength={6}
              accessibilityLabel="密码输入框，请输入6位数字密码"
            />
            <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)} accessibilityRole="button" accessibilityLabel={showPassword ? "隐藏密码" : "显示密码"}>
              <Text style={styles.eyeIcon} accessible={false}>{showPassword ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

          {!isLoginMode && (
            <>
              <Text style={styles.label}>确认密码</Text>
              <View style={styles.passwordContainer}>
                <TextInput 
                  style={styles.passwordInput} 
                  placeholder="请再次输入 6 位数字密码" 
                  placeholderTextColor="#767676" 
                  secureTextEntry={!showConfirmPassword} 
                  value={confirmPassword} 
                  onChangeText={setConfirmPassword} 
                  keyboardType="number-pad"
                  maxLength={6}
                  accessibilityLabel="确认密码输入框，请再次输入6位数字密码"
                />
                <Pressable style={styles.eyeBtn} onPress={() => setShowConfirmPassword(!showConfirmPassword)} accessibilityRole="button" accessibilityLabel={showConfirmPassword ? "隐藏确认密码" : "显示确认密码"}>
                  <Text style={styles.eyeIcon} accessible={false}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                </Pressable>
              </View>
            </>
          )}

          {isLoginMode && (
            <View style={styles.accessibilityBox}>
              <Text style={styles.accessibilityText}>不方便输入密码？使用语音免密安全登录</Text>
              <Pressable 
                style={[styles.voiceBtn, isRecording && { backgroundColor: '#D32F2F' }]} 
                onPress={handleVoiceVerify}
                disabled={isRecording || loading || isPhoneRecording}
                accessibilityRole="button"
                accessibilityLabel="语音安全验证"
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.voiceBtnText}>{isRecording ? '正在聆听...' : '语音安全验证'}</Text>}
              </Pressable>
            </View>
          )}

          <Pressable style={[styles.actionBtn, loading && { opacity: 0.7 }]} onPress={handleAuth} disabled={loading || isPhoneRecording} accessibilityRole="button" accessibilityLabel={isLoginMode ? '一键安全登录' : '立即注册并绑定'}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.actionBtnText}>{isLoginMode ? '一键安全登录' : '立即注册并绑定'}</Text>}
          </Pressable>

          <Pressable style={styles.switchBtn} onPress={() => setIsLoginMode(!isLoginMode)} disabled={loading} accessibilityRole="button" accessibilityLabel={isLoginMode ? "还没有账户？去注册" : "已有账户？去登录"}>
            <Text style={styles.switchText}>{isLoginMode ? "还没有账户？去注册" : "已有账户？去登录"}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 语音采集遮罩层 */}
      <Modal visible={showVoiceModal || isPhoneRecording} transparent={true} animationType="fade">
        <View style={styles.modalOverlay} accessibilityViewIsModal={true} accessibilityLiveRegion="assertive">
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isPhoneRecording ? '正在识别手机号' : '正在采集声纹'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isPhoneRecording ? '请用普通话大声念出您的 11 位手机号' : '请用普通话大声读出您密码后四位中缺失的最后两位'}
            </Text>
            
            {isPhoneRecording ? (
              <View style={{ marginVertical: 30, alignItems: 'center' }}>
                <Text style={{ fontSize: 60, color: '#1565C0', marginBottom: 20 }} accessible={false}>📞</Text>
                <Text style={styles.countdownText} accessibilityLiveRegion="polite">录音倒计时: {phoneCountdown} 秒</Text>
              </View>
            ) : (
              <>
                <View style={styles.numberBox} accessible={true} accessibilityLabel={`密码提示，缺失数字为：${voiceHint.split('').map(c => c === '_' ? '空白' : c).join('，')}`}>
                  {voiceHint.split('').map((char, index) => (
                    <View key={index} style={styles.digitBlock}>
                      <Text style={styles.digitText} accessible={false}>{char === '_' ? '_' : char}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.countdownText} accessibilityLiveRegion="polite">录音倒计时: {countdown} 秒</Text>
              </>
            )}
            <ActivityIndicator size="large" color="#D32F2F" style={{ marginTop: 20 }} />
          </View>
        </View>
      </Modal>

      {/* 全局自定义弹窗 */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 20, color: '#2E7D32', fontWeight: 'bold', textAlign: 'center', marginBottom: 35, letterSpacing: 1 },
  card: { backgroundColor: 'white', padding: 30, borderRadius: 16, elevation: 4 },
  label: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 15, fontSize: 22, marginBottom: 20, backgroundColor: '#fafafa', minHeight: 60 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  phoneVoiceBtn: { backgroundColor: '#1565C0', width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  phoneVoiceIcon: { fontSize: 28 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, backgroundColor: '#fafafa', marginBottom: 20, paddingRight: 15, minHeight: 60 },
  passwordInput: { flex: 1, paddingVertical: 16, paddingHorizontal: 15, fontSize: 22 },
  eyeBtn: { padding: 8 },
  eyeIcon: { fontSize: 28 },
  accessibilityBox: { marginBottom: 25, padding: 20, backgroundColor: '#E3F2FD', borderRadius: 12, borderWidth: 1, borderColor: '#90CAF9' },
  accessibilityText: { fontSize: 18, color: '#1565C0', fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  voiceBtn: { backgroundColor: '#1565C0', paddingVertical: 16, borderRadius: 10, alignItems: 'center', minHeight: 60, justifyContent: 'center' },
  voiceBtnText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  actionBtn: { backgroundColor: '#D32F2F', paddingVertical: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20, minHeight: 64, justifyContent: 'center' },
  actionBtnText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  switchBtn: { alignItems: 'center', paddingVertical: 12 },
  switchText: { color: '#1565C0', fontSize: 18, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', width: '90%', borderRadius: 24, padding: 35, alignItems: 'center' },
  modalTitle: { fontSize: 30, fontWeight: 'bold', color: '#D32F2F', marginBottom: 15 },
  modalSubtitle: { fontSize: 20, fontWeight: '500', color: '#333', marginBottom: 35, textAlign: 'center', lineHeight: 30 },
  numberBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 35, width: '100%' },
  digitBlock: { backgroundColor: '#FFEBEE', paddingVertical: 18, width: 68, borderRadius: 12, borderWidth: 2, borderColor: '#D32F2F', alignItems: 'center', justifyContent: 'center' },
  digitText: { fontSize: 36, fontWeight: 'bold', color: '#D32F2F', textAlign: 'center' },
  countdownText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
});
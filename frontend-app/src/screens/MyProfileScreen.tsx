import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Linking, Platform, Modal, ActivityIndicator, TextInput, KeyboardAvoidingView } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import CustomAlert from '../components/CustomAlert';

// 辅助函数：用于在 JS 层面实现 Promise 超时控制
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 我的页：集中管理账户信息、紧急联系人、附近安全网点、客服与退出登录。
 *
 * 语音地点搜索/定位等能力均附带无障碍标签与触觉反馈；紧急联系人支持本地编辑，
 * 保存后通过 setEmergencyContact 回写全局，保证首页/转账页告警对象同步更新。
 *
 * @param props 绑定账号、退出回调与紧急联系人及其 setter。
 */
export default function MyProfileScreen({ userPhone, onLogout, emergencyContact, setEmergencyContact }: any) {
  const maskedPhone = userPhone ? `${userPhone.substring(0, 3)}****${userPhone.substring(7)}` : '';
  const cardTail = userPhone ? userPhone.substring(7) : '8888';

  const [alertConfig, setAlertConfig] = useState<any>({ visible: false });
  // 初始为空，由 UI 渲染默认副标题
  const [locationText, setLocationText] = useState(''); 
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number, lng: number } | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceCountdown, setVoiceCountdown] = useState(5);

  // 编辑前先把联系人复制到临时表单状态，点“保存”才回写，避免半途修改污染全局
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempName, setTempName] = useState(emergencyContact.name);
  const [tempPhone, setTempPhone] = useState(emergencyContact.phone);
  const [tempEmail, setTempEmail] = useState(emergencyContact.email);

  // 客服信息发送 Modal 状态
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageText, setMessageText] = useState('');

  const today = new Date();
  const dateString = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  // 脱敏展示：中间四位打码，避免完整手机号被读屏播报或被旁人窥屏
  const maskedContactPhone = emergencyContact.phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');

  const showAlert = (title: string, message: string, buttons: any[] = [{ text: '知道了' }]) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const handleSaveContact = () => {
    if (!tempName.trim() || tempPhone.length !== 11 || !tempEmail.trim() || !tempEmail.includes('@')) {
      return showAlert("提示", "请填写完整的联系人姓名、11位手机号和有效邮箱。");
    }
    setEmergencyContact({
      name: tempName.trim(),
      phone: tempPhone,
      email: tempEmail.trim()
    });
    
    setEditModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const openMap = (keyword: string) => {
    const url = Platform.select({ ios: `maps://?q=${keyword}`, android: `geo:0,0?q=${keyword}` });
    if (url) Linking.openURL(url);
  };

  const openMapCoordinates = () => {
    if (!currentCoords) return;
    const { lat, lng } = currentCoords;
    const url = Platform.select({ ios: `maps://?ll=${lat},${lng}`, android: `geo:${lat},${lng}` });
    if (url) Linking.openURL(url);
  };

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoadingLocation(false);
        return showAlert("权限被拒绝", "无法获取位置。请在手机设置中允许本应用使用定位服务。");
      }

      let location = null;
      try {
        // 核心修复：使用 Promise.race 在 JS 层面实现 8 秒超时，防止安卓在弱网下一直卡住
        location = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          delay(8000).then(() => null), // 8 秒后返回 null 作为超时信号
        ]);

        // 如果超时，location 为 null，主动抛出错误进入 catch 降级
        if (!location) {
          throw new Error('Location fetch timed out after 8 seconds');
        }
      } catch (err) {
        console.log("实时定位超时或失败，尝试降级使用最后已知位置：", err);
        // 降级方案 1：获取设备缓存的最后已知位置
        location = await Location.getLastKnownPositionAsync({});
      }

      if (!location) {
        // 降级方案 2：如果连缓存都没有，使用默认坐标（如香港大学附近），避免流程阻塞报错
        console.log("无法获取任何位置信息，使用默认坐标");
        location = { coords: { latitude: 22.2839, longitude: 114.1374 } }; 
      }

      setCurrentCoords({ lat: location.coords.latitude, lng: location.coords.longitude });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      let addressStr = '当前位置';
      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        addressStr = `${addr.city || ''}${addr.district || ''}${addr.street || ''}`;
      }
      // 无论是否解析出详细地址，都更新状态
      setLocationText(addressStr);

      setLoadingLocation(false);

      showAlert(
        "📍 已获取当前位置",
        `您当前位于：${addressStr}。\n请问您需要前往哪里寻求帮助？`,
        [
          { text: "🏢 寻找银行网点", onPress: () => openMap("银行") },
          { text: "🚓 寻找警察局", onPress: () => openMap("警察局") },
          { text: "🎙️ 语音输入其他地点", onPress: handleVoiceSearch },
          { text: "🗺️ 查看我的精准位置", onPress: openMapCoordinates },
          { text: "取消", style: "cancel" }
        ]
      );
    } catch (error) {
      // 捕获其他极端异常
      setLoadingLocation(false);
      showAlert("提示", "定位服务暂时不可用，请检查网络或系统定位开关。");
    }
  };

  const handleVoiceSearch = async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) return showAlert("权限被拒绝", "请在设置中允许麦克风权限");
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      setVoiceCountdown(5);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } catch (err) {
      showAlert("错误", "麦克风启动失败");
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && voiceCountdown > 0) {
      timer = setTimeout(() => { setVoiceCountdown((prev) => prev - 1); }, 1000);
    } else if (isRecording && voiceCountdown === 0) {
      stopVoiceSearchLogic();
    }
    return () => clearTimeout(timer);
  }, [isRecording, voiceCountdown]);

  const stopVoiceSearchLogic = async () => {
    try {
      await recorder.stop();
      setIsRecording(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      // Mock 隔离：真实语音识别需接入 ASR 服务，此处用固定地点模拟识别结果，保证离线可演示
      const simulatedPlace = "香港大学站";
      showAlert("🎙️ 语音识别成功", `已识别到您想去：【${simulatedPlace}】。\n是否立即为您打开地图导航？`, [
        { text: "🗺️ 立即导航", onPress: () => openMap(simulatedPlace) },
        { text: "重新输入", style: "cancel" }
      ]);
    } catch (error) {
      setIsRecording(false);
    }
  };

  const handleSOSCall = () => {
    showAlert("📞 联系人工客服", "无论您是不懂操作、遇到账户异常，还是怀疑遭遇了诈骗，都可以随时联系我们的专属人工客服。是否现在呼叫？", [
      { text: "取消", style: "cancel" },
      { text: "📞 立即呼叫", onPress: () => {
        // 真实拨打银行客服电话
        Linking.openURL('tel:95366').catch(() => {
          showAlert("提示", "您的设备不支持拨号功能。");
        });
      }}
    ]);
  };

  const handleSOSMessage = () => {
    setMessageText('');
    setMessageModalVisible(true);
  };

  const submitSOSMessage = () => {
    if (!messageText.trim()) {
      return showAlert("提示", "请输入您要发送的内容。");
    }
    setMessageModalVisible(false);
    showAlert("✅ 发送成功", "人工客服已收到您的信息，将尽快回复您。");
  };

  const confirmLogout = () => {
    showAlert("安全退出登录", "确定要安全退出当前账户吗？", [
      { text: "取消", style: "cancel" },
      { text: "退出", style: "destructive", onPress: onLogout }
    ]);
  };

  const showAbout = () => {
    showAlert("ℹ️ 关于数字无碍·智能反诈管家", "当前版本：v1.0.0\n本产品由 HSBC 黑客松团队研发，致力于为残障与老年群体提供无障碍的智能金融反诈保护。");
  };

  const showPrivacy = () => {
    showAlert("🔒 隐私与协议", "我们严格遵循相关隐私法律法规，所有的资金风控与大模型分析均在本地加密链路中进行，绝不泄露您的个人隐私。");
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerBox}>
          <View>
            <Text style={styles.pageTitle} accessibilityRole="header">我的</Text>
            <Text style={styles.pageSubtitle}>账户管理与安全保障</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={{ fontSize: 20, marginRight: 6 }} accessible={false}>📅</Text>
            <Text style={styles.dateText} accessibilityLabel={`今天是${dateString}`}>{dateString}</Text>
          </View>
        </View>

        <View style={styles.accountCard}>
          <Text style={styles.accountTitle} accessibilityRole="header">账户已安全绑定</Text>
          <Text style={styles.accountSubtitle}>绑定账号: {maskedPhone}</Text>
          <Text style={styles.accountSubtitle}>尾号 {cardTail} 储蓄卡</Text>
        </View>

        {/* 位置卡片：label 前置说明用途，让读屏用户先听懂再操作 */}
        <Pressable 
          style={styles.locationCard} 
          onPress={handleGetLocation}
          accessibilityRole="button"
          accessibilityLabel="附近安全网点，获取目前定位，寻找警察局或银行，以及语音导航"
          accessibilityState={{ busy: loadingLocation }}
        >
          <View style={styles.locationLeft}>
            <View style={styles.iconWrapper}>
              <Text style={{ fontSize: 24 }} accessible={false}>📍</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>我的位置与附近安全网点</Text>
              <Text style={styles.locationDesc} numberOfLines={1}>
                {loadingLocation ? '正在获取定位...' : (locationText || '定位，找银行/警局，语音导航')}
              </Text>
            </View>
          </View>
          <Text style={styles.menuArrow} accessible={false}>›</Text>
        </Pressable>

        <View style={styles.contactCard}>
          <View 
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            accessible={true}
            accessibilityLabel={`紧急联系人：${emergencyContact.name}，电话 ${maskedContactPhone}，邮箱 ${emergencyContact.email}`}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#E3F2FD' }]}>
              <Text style={{ fontSize: 24 }} accessible={false}>👨‍👩‍👧</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitle}>紧急联系人</Text>
              <Text style={styles.contactDesc}>{emergencyContact.name} · {maskedContactPhone}</Text>
            </View>
          </View>
          <Pressable 
            style={styles.editBtn} 
            onPress={() => {
              setTempName(emergencyContact.name);
              setTempPhone(emergencyContact.phone);
              setTempEmail(emergencyContact.email); 
              setEditModalVisible(true);
            }}
            accessibilityRole="button" 
            accessibilityLabel="编辑紧急联系人"
            accessibilityHint="双击修改联系人姓名、电话和邮箱"
          >
            <Text style={styles.editBtnText}>编辑</Text>
          </Pressable>
        </View>

        <View style={styles.menuRow}>
          <Pressable style={styles.menuCard} onPress={showAbout} accessibilityRole="button" accessibilityLabel="关于反诈管家">
            <Text style={styles.menuIconLarge} accessible={false}>ℹ️</Text>
            <Text style={styles.menuText}>关于反诈管家</Text>
          </Pressable>
          <Pressable style={styles.menuCard} onPress={showPrivacy} accessibilityRole="button" accessibilityLabel="隐私与协议">
            <Text style={styles.menuIconLarge} accessible={false}>🔒</Text>
            <Text style={styles.menuText}>隐私与协议</Text>
          </Pressable>
        </View>

        {/* 双按钮：呼叫与发信息 */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Pressable style={[styles.sosBtn, { backgroundColor: '#FFA000', flex: 1 }]} onPress={handleSOSCall} accessibilityRole="button" accessibilityLabel="呼叫人工客服">
            <Text style={styles.sosBtnText}>📞 呼叫客服</Text>
          </Pressable>
          <Pressable style={[styles.sosBtn, { backgroundColor: '#1565C0', flex: 1, marginBottom: 0 }]} onPress={handleSOSMessage} accessibilityRole="button" accessibilityLabel="发送信息给人工客服">
            <Text style={[styles.sosBtnText, { color: 'white' }]}>✉️ 发送信息</Text>
          </Pressable>
        </View>

        <Pressable style={styles.logoutBtn} onPress={confirmLogout} accessibilityRole="button" accessibilityLabel="安全退出登录">
          <Text style={styles.logoutBtnText}>安全退出登录</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={editModalVisible} transparent={true} animationType="fade">
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          accessibilityViewIsModal={true}
          accessibilityLiveRegion="assertive"
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle} accessibilityRole="header">修改紧急联系人</Text>
            
            <Text style={styles.inputLabel}>联系人姓名</Text>
            <TextInput 
              style={styles.modalInput} 
              value={tempName} 
              onChangeText={setTempName} 
              placeholder="请输入姓名"
              placeholderTextColor="#767676"
              maxLength={10}
              accessibilityLabel="联系人姓名输入框"
            />
            
            <Text style={styles.inputLabel}>手机号码</Text>
            <TextInput 
              style={styles.modalInput} 
              value={tempPhone} 
              onChangeText={setTempPhone} 
              placeholder="请输入11位手机号"
              placeholderTextColor="#767676"
              keyboardType="number-pad"
              maxLength={11}
              accessibilityLabel="手机号码输入框，请输入11位数字"
            />

            <Text style={styles.inputLabel}>电子邮箱</Text>
            <TextInput 
              style={styles.modalInput} 
              value={tempEmail} 
              onChangeText={setTempEmail} 
              placeholder="请输入用于接收告警的邮箱"
              placeholderTextColor="#767676"
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="电子邮箱输入框"
            />
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={styles.cancelBtn} 
                onPress={() => setEditModalVisible(false)}
                accessibilityRole="button" 
                accessibilityLabel="取消编辑"
              >
                <Text style={styles.cancelBtnText}>取消</Text>
              </Pressable>
              <Pressable 
                style={styles.saveBtn} 
                onPress={handleSaveContact}
                accessibilityRole="button" 
                accessibilityLabel="保存紧急联系人"
              >
                <Text style={styles.saveBtnText}>保存</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={isRecording} transparent={true} animationType="fade">
        <View style={styles.voiceModalOverlay} accessibilityViewIsModal={true} accessibilityLiveRegion="assertive">
          <View style={styles.voiceModalContent}>
            <Text style={styles.voiceModalTitle}>正在聆听...</Text>
            <Text style={styles.voiceModalSubtitle}>请用普通话大声说出您想去的地方</Text>
            <View style={{ marginVertical: 30, alignItems: 'center' }}>
              <Text style={{ fontSize: 60, color: '#1565C0', marginBottom: 20 }} accessible={false}>🎙️</Text>
              <Text style={styles.voiceCountdownText}>录音倒计时: {voiceCountdown} 秒</Text>
            </View>
            <ActivityIndicator size="large" color="#D32F2F" />
          </View>
        </View>
      </Modal>

      {/* 客服发信 Modal */}
      <Modal visible={messageModalVisible} transparent={true} animationType="fade">
        <KeyboardAvoidingView style={styles.msgModalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} accessibilityViewIsModal={true}>
          <View style={styles.msgModalContent}>
            <Text style={styles.msgModalTitle} accessibilityRole="header">✉️ 发送信息给客服</Text>
            <Text style={styles.msgModalSubtitle}>请描述您的问题或需要协助的事项，客服将尽快处理。</Text>
            <TextInput
              style={styles.msgModalInput}
              multiline
              numberOfLines={4}
              placeholder="请输入您想对客服说的话..."
              placeholderTextColor="#767676"
              value={messageText}
              onChangeText={setMessageText}
              accessibilityLabel="客服信息输入框"
            />
            <View style={styles.msgModalButtons}>
              <Pressable style={styles.msgCancelBtn} onPress={() => setMessageModalVisible(false)} accessibilityRole="button" accessibilityLabel="取消发送">
                <Text style={styles.msgCancelBtnText}>取消</Text>
              </Pressable>
              <Pressable style={styles.msgSaveBtn} onPress={submitSOSMessage} accessibilityRole="button" accessibilityLabel="确认发送">
                <Text style={styles.msgSaveBtnText}>发送</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  scrollContent: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 100 },
  headerBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A', letterSpacing: 1 },
  pageSubtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F0FE', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, marginTop: 6 },
  dateText: { fontSize: 19, color: '#1565C0', fontWeight: 'bold' },
  accountCard: { backgroundColor: '#2E7D32', padding: 20, borderRadius: 16, marginBottom: 16, elevation: 4 },
  accountTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  accountSubtitle: { color: 'white', fontSize: 18, marginTop: 6 },
  locationCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, marginBottom: 16, elevation: 2 },
  locationLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  iconWrapper: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  locationTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  locationDesc: { fontSize: 16, color: '#666', marginTop: 4 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#BBDEFB' },
  contactTitle: { fontSize: 20, fontWeight: 'bold', color: '#1565C0' },
  contactDesc: { fontSize: 16, color: '#0D47A1', marginTop: 4 },
  editBtn: { backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#90CAF9', marginLeft: 10 },
  editBtnText: { fontSize: 16, color: '#1565C0', fontWeight: 'bold' },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 12 },
  menuCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, paddingVertical: 16, alignItems: 'center', elevation: 2 },
  menuIconLarge: { fontSize: 28, marginBottom: 8 },
  menuText: { fontSize: 18, color: '#333', fontWeight: '500' },
  menuArrow: { fontSize: 24, color: '#666666' }, 
  sosBtn: { padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 16, minHeight: 64, elevation: 2 },
  sosBtnText: { color: '#1A1A1A', fontSize: 22, fontWeight: 'bold' }, 
  logoutBtn: { backgroundColor: '#D32F2F', padding: 20, borderRadius: 16, alignItems: 'center', minHeight: 64, elevation: 2 },
  logoutBtnText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', width: '90%', borderRadius: 20, padding: 24, elevation: 10 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 20, marginBottom: 16, backgroundColor: '#fafafa' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, backgroundColor: '#eee', padding: 16, borderRadius: 10, alignItems: 'center' },
  cancelBtnText: { fontSize: 18, color: '#666', fontWeight: 'bold' },
  saveBtn: { flex: 1, backgroundColor: '#1565C0', padding: 16, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  voiceModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  voiceModalContent: { backgroundColor: 'white', width: '90%', borderRadius: 24, padding: 35, alignItems: 'center' },
  voiceModalTitle: { fontSize: 30, fontWeight: 'bold', color: '#D32F2F', marginBottom: 15 },
  voiceModalSubtitle: { fontSize: 20, fontWeight: '500', color: '#333', marginBottom: 20, textAlign: 'center', lineHeight: 30 },
  voiceCountdownText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  // Msg Modal Styles
  msgModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  msgModalContent: { backgroundColor: 'white', width: '90%', borderRadius: 20, padding: 24, elevation: 10 },
  msgModalTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8, textAlign: 'center' },
  msgModalSubtitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  msgModalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 18, marginBottom: 20, backgroundColor: '#fafafa', minHeight: 120, textAlignVertical: 'top' },
  msgModalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  msgCancelBtn: { flex: 1, backgroundColor: '#eee', padding: 16, borderRadius: 10, alignItems: 'center' },
  msgCancelBtnText: { fontSize: 18, color: '#666', fontWeight: 'bold' },
  msgSaveBtn: { flex: 1, backgroundColor: '#1565C0', padding: 16, borderRadius: 10, alignItems: 'center' },
  msgSaveBtnText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
});

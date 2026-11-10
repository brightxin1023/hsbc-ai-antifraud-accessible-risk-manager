import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Linking, Platform, Modal, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useAudioRecorder, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import CustomAlert from '../components/CustomAlert';

export default function MyProfileScreen({ userPhone, onLogout }: any) {
  const maskedPhone = userPhone ? `${userPhone.substring(0, 3)}****${userPhone.substring(7)}` : '';
  const cardTail = userPhone ? userPhone.substring(7) : '8888';

  const [alertConfig, setAlertConfig] = useState<any>({ visible: false });
  const [locationText, setLocationText] = useState('点击获取当前位置');
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  const [currentCoords, setCurrentCoords] = useState<{ lat: number, lng: number } | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceCountdown, setVoiceCountdown] = useState(5);

  const showAlert = (title: string, message: string, buttons: any[] = [{ text: '知道了' }]) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const openMap = (keyword: string) => {
    const url = Platform.select({
      ios: `maps://?q=${keyword}`,
      android: `geo:0,0?q=${keyword}`
    });
    if (url) Linking.openURL(url);
  };

  const openMapCoordinates = () => {
    if (!currentCoords) return;
    const { lat, lng } = currentCoords;
    const url = Platform.select({
      ios: `maps://?ll=${lat},${lng}`,
      android: `geo:${lat},${lng}`
    });
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

      const location = await Location.getCurrentPositionAsync({});
      setCurrentCoords({ lat: location.coords.latitude, lng: location.coords.longitude });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      let addressStr = '当前位置';
      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        addressStr = `${addr.city || ''}${addr.district || ''}${addr.street || ''}`;
        setLocationText(addressStr || '已获取当前位置');
      }

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
      setLoadingLocation(false);
      showAlert("获取失败", "网络或信号较弱，请稍后重试。");
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
      timer = setTimeout(() => {
        setVoiceCountdown((prev) => prev - 1);
      }, 1000);
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

      const simulatedPlace = "香港大学站";
      
      showAlert(
        "🎙️ 语音识别成功",
        `已识别到您想去：【${simulatedPlace}】。\n是否立即为您打开地图导航？`,
        [
          { text: "🗺️ 立即导航", onPress: () => openMap(simulatedPlace) },
          { text: "重新输入", style: "cancel" }
        ]
      );
    } catch (error) {
      setIsRecording(false);
    }
  };

  const handleSOSCall = () => {
    showAlert("📞 联系人工客服", "无论您是不懂操作、遇到账户异常，还是怀疑遭遇了诈骗，都可以随时联系我们的专属人工客服。是否现在呼叫？", [
      { text: "取消", style: "cancel" },
      { text: "📞 立即呼叫", onPress: () => showAlert("📞 正在接通", "正在为您转接专属人工客服，请稍候...", [{ text: "OK" }]) }
    ]);
  };

  const confirmLogout = () => {
    showAlert("安全退出登录", "确定要安全退出当前账户吗？", [
      { text: "取消", style: "cancel" },
      { text: "退出", style: "destructive", onPress: onLogout }
    ]);
  };

  const showAbout = () => {
    showAlert("关于反诈管家", "当前版本：v1.0.0\n本产品由 HSBC 黑客松团队研发，致力于为残障与老年群体提供无障碍的智能金融反诈保护。");
  };

  const showPrivacy = () => {
    showAlert("隐私与协议", "我们严格遵循相关隐私法律法规，所有的资金风控与大模型分析均在本地加密链路中进行，绝不泄露您的个人隐私。");
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 核心修复：将 paddingBottom 提升至 120，确保底部按钮不被悬浮的 Tab 栏遮挡 */}
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle} accessibilityRole="header">我的</Text>

        {/* 账户信息卡片 */}
        <View style={styles.accountCard}>
          <Text style={styles.accountTitle} accessibilityRole="header">账户已安全绑定</Text>
          <Text style={styles.accountSubtitle}>绑定账号: {maskedPhone}</Text>
          <Text style={styles.accountSubtitle}>尾号 {cardTail} 储蓄卡</Text>
        </View>

        {/* 我的位置卡片 */}
        <Pressable 
          style={styles.locationCard} 
          onPress={handleGetLocation}
          accessibilityRole="button"
          accessibilityLabel="获取我的位置，寻找附近地点"
          accessibilityState={{ busy: loadingLocation }}
        >
          <View style={styles.locationLeft}>
            <Text style={styles.locationIcon} accessible={false}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>我的位置</Text>
              <Text style={styles.locationDesc} numberOfLines={1}>
                {loadingLocation ? '正在获取位置...' : locationText}
              </Text>
            </View>
          </View>
          <Text style={styles.menuArrow} accessible={false}>›</Text>
        </Pressable>

        {/* 紧急联系人展示 */}
        <View style={styles.contactCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 32, marginRight: 12 }} accessible={false}>👨‍👩‍👧</Text>
            <View>
              <Text style={styles.contactTitle}>紧急联系人</Text>
              <Text style={styles.contactDesc}>辛先生 · 186****6207</Text>
            </View>
          </View>
        </View>

        {/* 功能列表区 */}
        <View style={styles.menuList}>
          <Pressable style={[styles.menuItem, styles.menuItemBorder]} onPress={showAbout} accessibilityRole="button" accessibilityLabel="关于反诈管家">
            <Text style={styles.menuText}>关于反诈管家</Text>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={showPrivacy} accessibilityRole="button" accessibilityLabel="隐私与协议">
            <Text style={styles.menuText}>隐私与协议</Text>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
        </View>

        {/* 操作按钮区 */}
        <Pressable style={styles.sosBtn} onPress={handleSOSCall} accessibilityRole="button" accessibilityLabel="呼叫人工客服">
          <Text style={styles.sosBtnText}>📞 呼叫人工客服</Text>
        </Pressable>

        <Pressable style={styles.logoutBtn} onPress={confirmLogout} accessibilityRole="button" accessibilityLabel="安全退出登录">
          <Text style={styles.logoutBtnText}>安全退出登录</Text>
        </Pressable>
      </ScrollView>

      {/* 语音识别遮罩层 */}
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
  // 新增：专门管理滚动区域的样式，增加 120 的底部留白
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  
  accountCard: { backgroundColor: '#2E7D32', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 4 },
  accountTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  accountSubtitle: { color: 'white', fontSize: 18, marginTop: 6 },

  locationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  locationLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  locationIcon: { fontSize: 36, marginRight: 12 },
  locationTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  locationDesc: { fontSize: 16, color: '#666', marginTop: 4 },
  
  contactCard: { backgroundColor: '#E3F2FD', borderRadius: 12, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#BBDEFB' },
  contactTitle: { fontSize: 20, fontWeight: 'bold', color: '#1565C0' },
  contactDesc: { fontSize: 16, color: '#0D47A1', marginTop: 4 },
  
  menuList: { backgroundColor: 'white', borderRadius: 12, marginBottom: 25, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuText: { fontSize: 20, color: '#333', fontWeight: '500' },
  menuArrow: { fontSize: 24, color: '#999' },
  
  sosBtn: { backgroundColor: '#FFA000', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 16, minHeight: 64 },
  sosBtnText: { color: '#1A1A1A', fontSize: 22, fontWeight: 'bold' }, 
  logoutBtn: { backgroundColor: '#D32F2F', padding: 20, borderRadius: 12, alignItems: 'center', minHeight: 64 },
  logoutBtnText: { color: 'white', fontSize: 22, fontWeight: 'bold' },

  voiceModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  voiceModalContent: { backgroundColor: 'white', width: '90%', borderRadius: 24, padding: 35, alignItems: 'center' },
  voiceModalTitle: { fontSize: 30, fontWeight: 'bold', color: '#D32F2F', marginBottom: 15 },
  voiceModalSubtitle: { fontSize: 20, fontWeight: '500', color: '#333', marginBottom: 20, textAlign: 'center', lineHeight: 30 },
  voiceCountdownText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
});
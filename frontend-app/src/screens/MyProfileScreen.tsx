import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import CustomAlert from '../components/CustomAlert';

export default function MyProfileScreen({ userPhone, onLogout }: any) {
  const maskedPhone = userPhone ? `${userPhone.substring(0, 3)}****${userPhone.substring(7)}` : '';
  const cardTail = userPhone ? userPhone.substring(7) : '8888';

  const [a11yEnabled, setA11yEnabled] = useState(true);
  const [alertConfig, setAlertConfig] = useState<any>({ visible: false });
  const showAlert = (title: string, message: string, buttons: any[] = [{ text: 'OK' }]) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const handleSOSCall = () => {
    showAlert(
      "📞 联系人工客服",
      "无论您是不懂操作、遇到账户异常，还是怀疑遭遇了诈骗，都可以随时联系我们的专属人工客服。是否现在呼叫？",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "📞 立即呼叫", 
          onPress: () => {
            showAlert("📞 正在接通", "正在为您转接专属人工客服，请稍候...", [{ text: "OK" }]);
          }
        }
      ]
    );
  };

  const confirmLogout = () => {
    showAlert("安全退出登录", "确定要安全退出当前账户吗？", [
      { text: "取消", style: "cancel" },
      { text: "退出", style: "destructive", onPress: onLogout }
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.pageTitle} accessibilityRole="header">我的</Text>

        <View style={styles.accountCard}>
          <Text style={styles.accountTitle} accessibilityRole="header">账户已安全绑定</Text>
          <Text style={styles.accountSubtitle}>绑定账号: {maskedPhone}</Text>
          <Text style={styles.accountSubtitle}>尾号 {cardTail} 储蓄卡</Text>
        </View>

        <View style={styles.contactCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 32, marginRight: 12 }} accessible={false}>👨‍👩‍👧</Text>
            <View>
              <Text style={styles.contactTitle}>紧急联系人</Text>
              <Text style={styles.contactDesc}>辛先生 · 186****6207</Text>
            </View>
          </View>
        </View>

        <View style={styles.switchCard}>
          <Text style={styles.switchLabel}>无障碍读屏优化已开启</Text>
          <Switch
            value={a11yEnabled}
            onValueChange={setA11yEnabled}
            trackColor={{ false: '#CCCCCC', true: '#2E7D32' }}
            thumbColor="#FFFFFF"
            accessibilityLabel="无障碍读屏优化开关"
            accessibilityState={{ checked: a11yEnabled }}
          />
        </View>

        <Pressable style={styles.sosBtn} onPress={handleSOSCall} accessibilityRole="button" accessibilityLabel="呼叫人工客服">
          <Text style={styles.sosBtnText}>📞 呼叫人工客服</Text>
        </Pressable>

        <Pressable style={styles.logoutBtn} onPress={confirmLogout} accessibilityRole="button" accessibilityLabel="安全退出登录">
          <Text style={styles.logoutBtnText}>安全退出登录</Text>
        </Pressable>
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
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, backgroundColor: '#f0f2f5' },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  accountCard: { backgroundColor: '#2E7D32', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 4 },
  accountTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  accountSubtitle: { color: 'white', fontSize: 18, marginTop: 6 },
  contactCard: { backgroundColor: '#E3F2FD', borderRadius: 12, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#BBDEFB' },
  contactTitle: { fontSize: 20, fontWeight: 'bold', color: '#1565C0' },
  contactDesc: { fontSize: 16, color: '#0D47A1', marginTop: 4 },
  switchCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 20 },
  switchLabel: { fontSize: 20, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 12 },
  sosBtn: { backgroundColor: '#FF9800', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 16, minHeight: 64 },
  sosBtnText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#D32F2F', padding: 20, borderRadius: 12, alignItems: 'center', minHeight: 64 },
  logoutBtnText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
});

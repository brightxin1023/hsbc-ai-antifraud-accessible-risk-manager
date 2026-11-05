import React from 'react';
import { ScrollView, View, Text, Pressable, Alert, StyleSheet } from 'react-native';

export default function HomeScreen({ isFrozen, userPhone, onLogout }: any) {
  const maskedPhone = userPhone ? `${userPhone.substring(0, 3)}****${userPhone.substring(7)}` : '';
  const cardTail = userPhone ? userPhone.substring(7) : '8888';

  const confirmLogout = () => {
    Alert.alert("退出登录", "确定要安全退出当前账户吗？", [
      { text: "取消", style: "cancel" },
      { text: "退出", style: "destructive", onPress: onLogout }
    ]);
  };

  // 🚀 扩充到 10 条数据，确保撑满屏幕，触发向下滑动
  const transactions = [
    {
      id: 1,
      title: '转账 - 某某科技有限公司',
      time: '今天 10:24',
      amount: '- ¥ 8,000.00',
      isExpense: true,
      isAbnormal: isFrozen, // 随全局冻结状态联动
    },
    {
      id: 2,
      title: '游戏充值 - 某某游戏平台',
      time: '今天 09:15',
      amount: '- ¥ 328.00',
      isExpense: true,
      isAbnormal: true, // 初始异常演示项
    },
    {
      id: 3,
      title: '收款 - 工资入账',
      time: '昨天 15:30',
      amount: '+ ¥ 12,500.00',
      isExpense: false,
      isAbnormal: false,
    },
    {
      id: 4,
      title: '外卖 - 某某餐饮',
      time: '昨天 12:10',
      amount: '- ¥ 35.50',
      isExpense: true,
      isAbnormal: false,
    },
    {
      id: 5,
      title: '退款 - 某某电商平台',
      time: '前天 18:45',
      amount: '+ ¥ 299.00',
      isExpense: false,
      isAbnormal: false,
    },
    {
      id: 6,
      title: '话费充值 - 中国移动',
      time: '前天 10:00',
      amount: '- ¥ 100.00',
      isExpense: true,
      isAbnormal: false,
    },
    {
      id: 7,
      title: '理财收益 - 稳健增长基金',
      time: '11月02日 09:00',
      amount: '+ ¥ 12.50',
      isExpense: false,
      isAbnormal: false,
    },
    {
      id: 8,
      title: '超市购物 - 某某连锁超市',
      time: '11月01日 20:15',
      amount: '- ¥ 256.00',
      isExpense: true,
      isAbnormal: false,
    },
    {
      id: 9,
      title: '滴滴出行 - 快车',
      time: '10月31日 08:30',
      amount: '- ¥ 25.00',
      isExpense: true,
      isAbnormal: false,
    },
    {
      id: 10,
      title: '收款 - 某某好友转账',
      time: '10月30日 19:20',
      amount: '+ ¥ 500.00',
      isExpense: false,
      isAbnormal: false,
    }
  ];

  return (
    // 🚀 最外层使用了 ScrollView，只要内容超长，自动开启丝滑滚动
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }} // 底部留白，避免滑到底部被 Tab 栏挡住
    >
      
      {/* 顶部绿卡 */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={styles.headerTitle} accessibilityRole="header">账户已安全绑定</Text>
            <Text style={styles.headerSubtitle}>绑定账号: {maskedPhone}</Text>
            <Text style={styles.headerSubtitle}>尾号 {cardTail} 储蓄卡</Text>
          </View>
          <Pressable onPress={confirmLogout} style={styles.logoutBtn} accessibilityLabel="退出登录">
            <Text style={styles.logoutText}>退出</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionTitle} accessibilityRole="header">近期交易流水</Text>
      
      {/* 大厂风格的列表式流水 */}
      <View style={styles.listContainer}>
        {transactions.map((tx, index) => (
          <View 
            key={tx.id} 
            style={[styles.listItem, index !== transactions.length - 1 && styles.listItemBorder]}
            accessible={true}
            accessibilityLabel={`${tx.title}，时间${tx.time}，金额${tx.amount}。${tx.isAbnormal ? '状态异常，已拦截。' : '状态正常。'}`}
          >
            <View style={styles.txLeft}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                {tx.isAbnormal && (
                  <View style={styles.badgeError}>
                    <Text style={styles.badgeErrorText}>⚠️ 异常拦截</Text>
                  </View>
                )}
              </View>
              <Text style={styles.txTime}>{tx.time}</Text>
            </View>
            
            <Text style={[
              styles.txAmount, 
              tx.isExpense ? { color: '#333' } : { color: '#2E7D32' }, 
              tx.isAbnormal && { textDecorationLine: 'line-through', color: '#999' }
            ]}>
              {tx.amount}
            </Text>
          </View>
        ))}
      </View>

      {/* 底部客服专区 */}
      <View style={styles.serviceBox}>
        <Text style={styles.serviceText}>遇到不明扣款或疑似诈骗？</Text>
        <Pressable 
          style={styles.sosButton} 
          onPress={() => Alert.alert("📞 人工协助", "正在为您转接专属反诈客服...")}
          accessibilityLabel="一键呼叫人工协助，转接专属反诈客服"
        >
          <Text style={styles.buttonText}>📞 一键呼叫人工协助</Text>
        </Pressable>
      </View>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, backgroundColor: '#f0f2f5' },
  headerCard: { backgroundColor: '#2E7D32', padding: 20, borderRadius: 12, marginBottom: 25, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: 'white', fontSize: 15, marginTop: 5, opacity: 0.9 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  logoutText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  listContainer: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  listItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  txLeft: { flex: 1 },
  txTitle: { fontSize: 16, fontWeight: '500', color: '#333', marginRight: 8 },
  txTime: { fontSize: 13, color: '#999', marginTop: 6 },
  txAmount: { fontSize: 18, fontWeight: 'bold' },
  badgeError: { backgroundColor: '#FFEBEE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FFCDD2' },
  badgeErrorText: { fontSize: 12, color: '#D32F2F', fontWeight: 'bold' },
  serviceBox: { backgroundColor: '#FFF3E0', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FFE0B2' },
  serviceText: { fontSize: 15, color: '#E65100', marginBottom: 12, fontWeight: 'bold' },
  sosButton: { backgroundColor: '#FF9800', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
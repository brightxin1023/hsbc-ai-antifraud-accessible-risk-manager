import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';

export default function TransactionHistoryScreen({ transactions, onBack }: any) {
  const renderItem = ({ item, index }: any) => {
    let accessibilityStatus = '安全交易。';
    if (item.isAbnormal) accessibilityStatus = '状态异常，资金已拦截。';
    else if (item.isRisk === 'high') accessibilityStatus = '高危交易，已汇出。';
    else if (item.isRisk === 'medium') accessibilityStatus = '可疑交易，已汇出。';

    const rawAmount = item.amount || '';
    const isExpense = item.isExpense;
    const cleanAmount = rawAmount.replace(/^[-+]\s*/, '');

    return (
      <View
        style={[styles.listItem, index !== transactions.length - 1 && styles.listItemBorder]}
        accessible={true}
        accessibilityLabel={`${item.title}，时间${item.time}，金额${isExpense ? '减' : '加'}${cleanAmount}。${accessibilityStatus}`}
      >
        <View style={styles.txLeft}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={styles.txTitle}>{item.title}</Text>
            {item.isAbnormal && (
              <View style={styles.badgeError}><Text style={styles.badgeErrorText}>🛑 异常拦截</Text></View>
            )}
            {item.isRisk === 'high' && !item.isAbnormal && (
              <View style={styles.badgeHighRisk}><Text style={styles.badgeHighRiskText}>🚨 高危交易</Text></View>
            )}
            {item.isRisk === 'medium' && !item.isAbnormal && (
              <View style={styles.badgeWarning}><Text style={styles.badgeWarningText}>⚠️ 可疑交易</Text></View>
            )}
            {(!item.isRisk || item.isRisk === 'low') && !item.isAbnormal && (
              <View style={styles.badgeLowRisk}><Text style={styles.badgeLowRiskText}>✅ 安全交易</Text></View>
            )}
          </View>
          <Text style={styles.txTime}>{item.time}</Text>
        </View>

        <View style={styles.amountContainer}>
          {isExpense ? (
            <View style={[styles.customMinusSign, item.isAbnormal && { backgroundColor: '#666' }]} />
          ) : (
            <View style={styles.customPlusWrapper}>
              <View style={styles.plusHorizontal} />
              <View style={styles.plusVertical} />
            </View>
          )}
          <View style={styles.amountTextWrapper}>
            <Text style={[styles.txAmount, isExpense ? { color: '#333' } : { color: '#2E7D32' }, item.isAbnormal && { color: '#666', opacity: 0.7 }]}>
              {cleanAmount}
            </Text>
            {item.isAbnormal && (<View style={styles.redStrikethrough} />)}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="返回上一页" accessibilityHint="回到首页">
          <Text style={styles.backBtnText}>← 返回</Text>
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">全部交易流水</Text>
      </View>

      <View style={styles.listWrap}>
        <FlatList
          data={transactions}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { paddingVertical: 6, paddingRight: 12, minHeight: 44, justifyContent: 'center' },
  backBtnText: { fontSize: 20, color: '#1976D2', fontWeight: 'bold' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center', marginRight: 44 },
  listWrap: { flex: 1, backgroundColor: 'white', borderRadius: 12, margin: 20, overflow: 'hidden' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  listItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  txLeft: { flex: 1 },
  txTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginRight: 8 },
  txTime: { fontSize: 16, color: '#666', marginTop: 8 },
  amountContainer: { flexDirection: 'row', alignItems: 'center' },
  customMinusSign: { width: 14, height: 2.5, backgroundColor: '#333', marginRight: 6, borderRadius: 1 },
  customPlusWrapper: { width: 14, height: 14, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  plusHorizontal: { position: 'absolute', width: 14, height: 2.5, backgroundColor: '#2E7D32', borderRadius: 1 },
  plusVertical: { position: 'absolute', width: 2.5, height: 14, backgroundColor: '#2E7D32', borderRadius: 1 },
  amountTextWrapper: { position: 'relative', justifyContent: 'center', height: 30 },
  txAmount: { fontSize: 24, fontWeight: 'bold', lineHeight: 30 },
  redStrikethrough: { position: 'absolute', left: -2, right: -2, height: 2, backgroundColor: '#FF3B30', top: 14 },
  badgeError: { backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#FFCDD2', marginLeft: 8 },
  badgeErrorText: { fontSize: 14, color: '#D32F2F', fontWeight: 'bold' },
  badgeHighRisk: { backgroundColor: '#D32F2F', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 8 },
  badgeHighRiskText: { fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' },
  badgeWarning: { backgroundColor: '#FFF8E1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#FFE082', marginLeft: 8 },
  badgeWarningText: { fontSize: 14, color: '#D84315', fontWeight: 'bold' },
  badgeLowRisk: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#A5D6A7', marginLeft: 8 },
  badgeLowRiskText: { fontSize: 14, color: '#2E7D32', fontWeight: 'bold' },
});

import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from 'react-native';

export default function EduScreen() {
  const playVoice = (content: string) => {
    Alert.alert("🔊 语音播报", `正在为您朗读：${content}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle} accessibilityRole="header">反诈防骗小课堂</Text>
      <Text style={styles.pageSubtitle}>全民反诈，守护您的钱袋子</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛡️ 绝不向陌生账户转账</Text>
        <Text style={styles.cardContent}>
          公检法机关、银行客服绝对不会通过电话、微信要求您将钱转入所谓的“安全账户”。
        </Text>
        <Pressable 
          style={styles.voiceButton} 
          onPress={() => playVoice("公检法机关绝对不会要求您转账。")}
          accessibilityLabel="点击朗读：绝不向陌生账户转账"
        >
          <Text style={styles.voiceButtonText}>🔊 语音播报</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚠️ 警惕“高回报”投资理财</Text>
        <Text style={styles.cardContent}>
          凡是号称“稳赚不赔”、“日赚千元”的网络投资、刷单兼职，100% 都是诈骗。天上不会掉馅饼。
        </Text>
        <Pressable 
          style={styles.voiceButton} 
          onPress={() => playVoice("警惕高回报投资理财，天上不会掉馅饼。")}
          accessibilityLabel="点击朗读：警惕高回报投资理财"
        >
          <Text style={styles.voiceButtonText}>🔊 语音播报</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📞 遇到疑问请拨打 96110</Text>
        <Text style={styles.cardContent}>
          遇到任何拿不准的电话或信息，请立刻挂断，并拨打全国反诈专线 96110 寻求帮助。
        </Text>
        <Pressable 
          style={styles.voiceButton} 
          onPress={() => playVoice("遇到疑问请拨打全国反诈专线96110。")}
          accessibilityLabel="点击朗读：遇到疑问请拨打96110"
        >
          <Text style={styles.voiceButtonText}>🔊 语音播报</Text>
        </Pressable>
      </View>

      <View style={{ height: 40 }} /> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#D32F2F', marginBottom: 8, textAlign: 'center' },
  pageSubtitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: '#333333' },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#000000', marginBottom: 10 },
  cardContent: { fontSize: 18, color: '#222222', lineHeight: 28, marginBottom: 15 },
  voiceButton: { backgroundColor: '#1976D2', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  voiceButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
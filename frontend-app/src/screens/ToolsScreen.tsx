import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import ScriptDetectScreen from './ScriptDetectScreen';
import QAScreen from './QAScreen';

/**
 * 反诈工具箱入口：用局部状态 activeTool 在“菜单/剧本扫描/智能问答”之间切换。
 *
 * 子工具在本页内部渲染，不占用全局底部导航；返回时只回退局部状态，
 * 保持底部 Tab 架构稳定，同时让每个工具可独立复用。
 */
export default function ToolsScreen() {
  // 局部路由：工具切换只影响本页，避免污染全局 currentPage 与底部导航状态
  const [activeTool, setActiveTool] = useState<'menu' | 'script' | 'qa'>('menu');

  if (activeTool === 'script') {
    return <ScriptDetectScreen onBack={() => setActiveTool('menu')} />;
  }
  if (activeTool === 'qa') {
    return <QAScreen onBack={() => setActiveTool('menu')} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle} accessibilityRole="header">反诈工具箱</Text>
      <Text style={styles.pageSubtitle}>选择工具，守护您的每一笔资金安全</Text>

      <Pressable
        style={styles.card}
        onPress={() => setActiveTool('script')}
        accessibilityRole="button"
        accessibilityLabel="涉诈剧本扫描，一键检测短信或聊天记录"
      >
        <Text style={styles.cardIcon} accessible={false}>📩</Text>
        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>涉诈剧本扫描</Text>
          <Text style={styles.cardSubtitle}>一键检测短信/聊天记录</Text>
        </View>
        <Text style={styles.cardArrow} accessible={false}>›</Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => setActiveTool('qa')}
        accessibilityRole="button"
        accessibilityLabel="反诈智能问答，向智能反诈管家提问"
      >
        <Text style={styles.cardIcon} accessible={false}>💬</Text>
        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>反诈智能问答</Text>
          <Text style={styles.cardSubtitle}>向智能反诈管家提问</Text>
        </View>
        <Text style={styles.cardArrow} accessible={false}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, backgroundColor: '#f0f2f5' },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  pageSubtitle: { fontSize: 18, color: '#666', marginBottom: 25 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2 },
  cardIcon: { fontSize: 40, marginRight: 16 },
  cardTextWrap: { flex: 1 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  cardSubtitle: { fontSize: 18, color: '#666', marginTop: 6 },
  cardArrow: { fontSize: 28, color: '#BDBDBD', marginLeft: 8 },
});

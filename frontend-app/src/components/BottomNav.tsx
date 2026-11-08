import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function BottomNav({ currentPage, setCurrentPage }: any) {
  // 将 Tab 配置抽离，避免写 5 遍重复代码
  const tabs = [
    { key: 'home', label: '首页', icon: '🏠' },
    { key: 'transfer', label: '转账', icon: '💸' },
    { key: 'script', label: '剧本', icon: '📩' },
    { key: 'qa', label: '问答', icon: '💬' },
    { key: 'edu', label: '科普', icon: '📖' },
  ];

  return (
    <View style={styles.navBar} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const isSelected = currentPage === tab.key;
        
        return (
          <Pressable 
            key={tab.key}
            onPress={() => setCurrentPage(tab.key)} 
            style={styles.navItem}
            // 核心无障碍改造开始
            accessibilityRole="tab" // 声明为标签页
            accessibilityState={{ selected: isSelected }} // 声明选中状态
            accessibilityLabel={`${tab.label}${isSelected ? '，当前已选中' : ''}`} // 定制播报语音
            // 核心无障碍改造结束
          >
            <Text style={[styles.navText, isSelected && styles.navTextActive]}>
              {tab.icon} {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' }, 
  navText: { fontSize: 14, color: '#666' },
  navTextActive: { color: '#D32F2F', fontWeight: 'bold' },
});
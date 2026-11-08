import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function BottomNav({ currentPage, setCurrentPage }: any) {
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
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${tab.label}${isSelected ? '，当前已选中' : ''}`}
          >
            <Text style={styles.navIcon} accessible={false}>{tab.icon}</Text>
            <Text style={[styles.navText, isSelected && styles.navTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // 优化：加大顶部和底部的 padding，让菜单栏更饱满，触摸区域更大
  navBar: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10, paddingBottom: 25, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
  // 优化：确保每个 tab 的点击高度至少 50pt
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 50 }, 
  // 优化：单独提取图标样式并放大
  navIcon: { fontSize: 24, marginBottom: 2 },
  // 优化：字号从 14 放大到 16
  navText: { fontSize: 16, color: '#666' },
  navTextActive: { color: '#D32F2F', fontWeight: 'bold' },
});
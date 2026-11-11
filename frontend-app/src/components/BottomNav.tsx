import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

/**
 * 底部导航：五个 Tab 的全局导航入口。
 *
 * 用 accessibilityRole="tab"/"tablist" + accessibilityState.selected 让读屏用户
 * 能识别当前所在页；Tab 项最小高度 50 保证触控目标足够大。
 *
 * @param currentPage 当前页面 key。
 * @param setCurrentPage 切换页面的回调。
 */
export default function BottomNav({ currentPage, setCurrentPage }: any) {
  const tabs = [
    { key: 'home', label: '首页', icon: '房子' },
    { key: 'transfer', label: '转账', icon: '钞票' },
    { key: 'tools', label: '工具箱', icon: '箱子' },
    { key: 'edu', label: '科普', icon: '书籍' },
    { key: 'profile', label: '我的', icon: '人像' },
  ];

  return (
    // 无障碍优化：声明此区域为 tablist，帮助读屏软件识别底部导航结构
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
            {/* 新增注释：强制单行显示并允许自动缩放，防止超大字号下文字竖排 */}
            <Text 
              style={[styles.navText, isSelected && styles.navTextActive]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10, paddingBottom: 25, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 50 }, 
  navIcon: { fontSize: 24, marginBottom: 2 },
  navText: { fontSize: 16, color: '#555' }, 
  navTextActive: { color: '#B71C1C', fontWeight: 'bold' }, 
});

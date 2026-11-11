import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function BottomNav({ currentPage, setCurrentPage }: any) {
  const tabs = [
    { key: 'home', label: '首页', icon: '🏠' },
    { key: 'transfer', label: '转账', icon: '💸' },
    { key: 'tools', label: '工具箱', icon: '🧰' },
    { key: 'edu', label: '科普', icon: '📖' },
    { key: 'profile', label: '我的', icon: '👤' },
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

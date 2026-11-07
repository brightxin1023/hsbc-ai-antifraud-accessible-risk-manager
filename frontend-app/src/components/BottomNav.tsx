import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function BottomNav({ currentPage, setCurrentPage }: any) {
  return (
    <View style={styles.navBar}>
      <Pressable onPress={() => setCurrentPage('home')} style={styles.navItem}>
        <Text style={[styles.navText, currentPage === 'home' && styles.navTextActive]}>🏠 首页</Text>
      </Pressable>
      <Pressable onPress={() => setCurrentPage('transfer')} style={styles.navItem}>
        <Text style={[styles.navText, currentPage === 'transfer' && styles.navTextActive]}>💸 转账</Text>
      </Pressable>
      <Pressable onPress={() => setCurrentPage('script')} style={styles.navItem}>
        <Text style={[styles.navText, currentPage === 'script' && styles.navTextActive]}>📩 剧本</Text>
      </Pressable>
      <Pressable onPress={() => setCurrentPage('qa')} style={styles.navItem}>
        <Text style={[styles.navText, currentPage === 'qa' && styles.navTextActive]}>💬 问答</Text>
      </Pressable>
      <Pressable onPress={() => setCurrentPage('edu')} style={styles.navItem}>
        <Text style={[styles.navText, currentPage === 'edu' && styles.navTextActive]}>📖 科普</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' }, // flex: 1 确保均分
  navText: { fontSize: 14, color: '#666' },
  navTextActive: { color: '#D32F2F', fontWeight: 'bold' },
});
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function BottomNav({ currentPage, setCurrentPage }: any) {
  return (
    <View style={styles.navBar}>
      <Pressable onPress={() => setCurrentPage('home')} style={styles.navItem}>
        <Text style={[styles.navText, currentPage === 'home' && styles.navTextActive]}>🏠 首页</Text>
      </Pressable>
      <Pressable onPress={() => setCurrentPage('detect')} style={styles.navItem}>
        <Text style={[styles.navText, currentPage === 'detect' && styles.navTextActive]}>🛡️ 检测</Text>
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
  navBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#ddd' },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 16, color: '#666' },
  navTextActive: { color: '#D32F2F', fontWeight: 'bold' },
});
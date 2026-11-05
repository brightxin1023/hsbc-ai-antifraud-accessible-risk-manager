import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EduScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>反诈宣教科普模块开发中...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, color: '#666' }
});
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { askQuestionApi } from '../services/api';

export default function QAScreen() {
  const [qaQuery, setQaQuery] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaLoading, setQaLoading] = useState(false);

  const askQuestion = async () => {
    if (!qaQuery) return Alert.alert("提示", "请输入您的问题");
    setQaLoading(true);
    setQaAnswer('');
    try {
      const data = await askQuestionApi(qaQuery);
      setQaAnswer(data.answer);
    } catch (error) {
      Alert.alert("网络错误", "无法连接到后端");
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>反诈智能问答</Text>
      <TextInput style={styles.input} placeholder="遇到不懂的套路？直接问 AI 助手" multiline value={qaQuery} onChangeText={setQaQuery} />
      <Pressable style={styles.actionBtn} onPress={askQuestion} disabled={qaLoading}>
        {qaLoading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>向 AI 提问</Text>}
      </Pressable>

      {qaAnswer ? (
        <View style={styles.answerCard}>
          <Text style={styles.answerTitle}>AI 助手回答：</Text>
          <Text style={styles.answerText}>{qaAnswer}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 15, fontSize: 18, height: 120, textAlignVertical: 'top', marginBottom: 20 },
  actionBtn: { backgroundColor: '#D32F2F', padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  answerCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginTop: 20, borderLeftWidth: 5, borderLeftColor: '#D32F2F' },
  answerTitle: { fontSize: 18, fontWeight: 'bold', color: '#D32F2F', marginBottom: 10 },
  answerText: { fontSize: 18, color: '#333', lineHeight: 28 }
});
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function App() {
  const handlePress = () => {
    // 触发最高级别的错误提示震动，替代传统声音报警
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handlePress}
        accessible={true}
        accessibilityLabel="高危交易预警，点击触发强烈震动"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>拦截可疑交易</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  button: { backgroundColor: '#FF0000', padding: 30, borderRadius: 15 },
  buttonText: { color: '#FFFFFF', fontSize: 36, fontWeight: 'bold' }
});
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

interface ButtonConfig {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: ButtonConfig[];
  onClose: () => void;
}

export default function CustomAlert({ visible, title, message, buttons, onClose }: CustomAlertProps) {
  if (!visible) return null;

  const finalButtons = buttons && buttons.length > 0 ? buttons : [{ text: 'OK', onPress: onClose }];

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay} accessibilityViewIsModal={true} accessibilityLiveRegion="assertive" accessible={false}>
        {/* 优化点：把之前的 width: 300 改成了百分比宽度，让长标题自动撑开 */}
        <View style={styles.alertBox}>
          <View 
            style={styles.content} 
            accessible={true}
            accessibilityLabel={message ? `${title}。${message}` : title}
          >
            <Text style={styles.title} accessibilityRole="header">{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
          
          <View style={styles.divider} />
          
          <View style={finalButtons.length > 2 ? styles.buttonColumn : styles.buttonRow}>
            {finalButtons.map((btn, index) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              
              return (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <View style={finalButtons.length > 2 ? styles.divider : styles.dividerVertical} />
                  )}
                  <Pressable
                    style={[
                      styles.button,
                      finalButtons.length <= 2 ? { flex: 1 } : { width: '100%' }
                    ]}
                    onPress={() => {
                      onClose();
                      if (btn.onPress) btn.onPress();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={btn.text}
                  >
                    <Text style={[
                      styles.buttonText,
                      isDestructive && { color: '#FF453A' },
                      isCancel ? { fontWeight: '400' } : { fontWeight: '600' } 
                    ]}>
                      {btn.text}
                    </Text>
                  </Pressable>
                </React.Fragment>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    // 核心修改：使用百分比宽度和最大宽度限制
    width: '85%', 
    maxWidth: 400, 
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 20, // 稍微收窄了一点水平内边距
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#D1D1D6',
    textAlign: 'center',
    lineHeight: 24,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#3A3A3C',
  },
  dividerVertical: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#3A3A3C',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  buttonColumn: {
    flexDirection: 'column',
    width: '100%',
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 55,
  },
  buttonText: {
    fontSize: 18,
    color: '#0A84FF',
  },
});
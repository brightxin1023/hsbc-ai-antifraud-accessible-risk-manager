import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

/** 弹窗按钮配置：text 为按钮文案，style 决定着色（默认/取消/危险）。 */
interface ButtonConfig {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/** 弹窗属性：控制显隐、标题/正文与按钮列表，onClose 为必选关闭回调。 */
interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: ButtonConfig[];
  onClose: () => void;
}

/**
 * 全局统一弹窗：替代原生 Alert。
 *
 * 原生 Alert 无法自定义 20/22 大字号与高对比度、按钮语义在 iOS/Android 上不一致，
 * 也不满足读屏语义；这里用 Modal 自建，保证所有告警外观与无障碍行为一致。
 *
 * @param props visible/title/message 控制内容，buttons 支持 destructive/cancel 样式。
 */
export default function CustomAlert({ visible, title, message, buttons, onClose }: CustomAlertProps) {
  if (!visible) return null;

  const finalButtons = buttons && buttons.length > 0 ? buttons : [{ text: 'OK', onPress: onClose }];

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay} accessibilityViewIsModal={true} accessibilityLiveRegion="assertive" accessible={false}>
        {/* 大字号 + 长标题适配：用百分比宽度而非固定 300，避免大字体下文字溢出被裁剪 */}
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
    // 百分比宽度 + maxWidth 双重约束：小屏不溢出、大屏不过宽，适配大字号标题
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
    paddingHorizontal: 20, // 略收窄内边距，给 20 号正文留出更多可读行宽
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
    // 用 minHeight 而非固定 height：防止大字号文字被裁切，同时保证足够触控面积
    minHeight: 55,
  },
  buttonText: {
    fontSize: 18,
    color: '#0A84FF',
  },
});
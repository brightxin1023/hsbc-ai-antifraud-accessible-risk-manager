import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import CustomAlert from '../components/CustomAlert';

const ARTICLE_DETAILS: any = {
  '1': { icon: '🛡️', title: '绝不向陌生账户转账', case: '张阿姨接到自称“公安局”的电话，称其涉嫌洗钱，需将资金转入“安全账户”。张阿姨信以为真，转账后发现被骗。', advice: '公检法机关绝对不会通过电话办案，也没有所谓的“安全账户”。遇到此类情况，请立即挂断并拨打 110 报警。' },
  '2': { icon: '⚠️', title: '警惕“高回报”投资理财', case: '李大爷在微信上认识了一位“理财导师”，被拉入投资群。前期小赚几笔后，李大爷投入 20 万养老钱，随后平台无法提现，导师失联。', advice: '天上不会掉馅饼。网恋对象、投资导师只要提到“稳赚不赔”、“带你赚钱”，100% 是诈骗，请立刻拉黑。' },
  '3': { icon: '📞', title: '遇到疑问请拨打全国反诈专线 96110', case: '王先生接到一通声称其包裹藏毒的恐吓电话，在即将转账时，想起社区宣传的 96110 专线。拨打咨询后，成功避免被骗。', advice: '全国反诈专线 96110 是警方的预警劝阻专线。接到此号码来电，说明您可能正在遭遇诈骗，请务必接听。' },
  '4': { icon: '📦', title: '警惕“客服理赔”骗局', case: '赵女士接到“淘宝客服”电话，称其购买的物品丢失要双倍赔偿，诱导赵女士开启屏幕共享并借出 3 万元备用金。', advice: '正规平台的退款会原路返回，不会要求你下载会议软件、屏幕共享或提供验证码。请务必在官方 App 内核实。' },
  '5': { icon: '💳', title: 'ETC/医保卡过期短信诈骗', case: '刘先生收到短信称其 ETC 已过期，需点击链接重新认证。点开链接填写银行卡号及验证码后，卡内 5000 元被盗刷。', advice: '官方业务不会通过带有陌生链接的短信办理。请勿点击链接，直接去官方 APP 或线下网点核实。' },
  '6': { icon: '💔', title: '警惕“杀猪盘”网恋投资', case: '陈女士在婚恋网站结识了“高富帅”，对方带她在一个博彩平台投资。陈女士先后投入 50 余万元，最终发现平台无法登录，对方将其拉黑。', advice: '素未谋面的网恋对象，只要提到“投资、博彩、带你赚钱”，100%是杀猪盘诈骗，请立刻断绝联系。' },
  '7': { icon: '👔', title: '冒充领导/熟人借钱', case: '公司财务小周收到“老板”微信，要求紧急转账 10 万元给合作方。小周未电话核实直接转账，事后发现老板微信号被盗。', advice: '凡是熟人、领导通过社交软件要求转账，必须通过打电话或当面核实身份，切勿仅凭文字转账。' },
  '8': { icon: '🎓', title: '注销校园贷/影响征信', case: '大学生小李接到电话称其学生时期注册过校园贷，不注销会影响征信。小李在对方引导下从多个平台借款并转入对方账户，被骗 3 万元。', advice: '个人征信由中国人民银行统一管理，任何人无权删除或修改，不存在“注销校园贷”的说法。' },
  '9': { icon: '💸', title: '刷单返利诈骗', case: '全职妈妈王女士看到“点赞赚佣金”的广告，进群后先做了几单小额任务赚了钱。随后做大单垫付 2 万元后，对方以“连单任务未完成”为由拒绝退款。', advice: '所有要求垫资的刷单、点赞兼职都是诈骗，切勿贪小便宜，天上不会掉馅饼。' },
  '10': { icon: '🔞', title: '裸聊敲诈勒索', case: '大学生小张在网上结识了一名“美女”，在对方诱导下下载了不明APP并裸聊。随后对方利用木马获取了小张的通讯录，以群发不雅视频为由敲诈了 5 万元。', advice: '千万不要和陌生人视频裸聊，不点不明链接，不下载不明APP。一旦被敲诈，立即报警，绝对不要给钱。' }
};

export default function EduDetailScreen({ articleId, onBack }: { articleId: string, onBack: () => void }) {
  const article = ARTICLE_DETAILS[articleId];
  
  // 🌟 引入 CustomAlert 的状态管理
  const [alertConfig, setAlertConfig] = useState<any>({ visible: false });
  const showAlert = (title: string, message: string, buttons: any[] = [{ text: 'OK' }]) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  // 🌟 修复 Bug：去掉了 case 后面多余的手动句号，避免出现“。。”
  const fullVoiceText = article 
    ? `${article.title}。真实案例：${article.case}防骗指南：${article.advice}` 
    : '';

  const playVoice = () => {
    showAlert("🔊 语音播报", fullVoiceText);
  };

  const handleCall96110 = () => {
    showAlert(
      "📞 呼叫全国反诈专线",
      "是否立即拨打 96110 进行咨询？",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "📞 立即呼叫", 
          onPress: () => {
            showAlert("📞 正在呼叫", "正在为您接通全国反诈专线 96110...", [{ text: "OK" }]);
          }
        }
      ]
    );
  };

  if (!article) return null;

  const is96110Article = articleId === '3';

  return (
    <View style={styles.container}>
      {/* 优化后的顶部导航栏 */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backBtn} 
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="返回科普列表"
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backBtnText}>返回列表</Text>
        </Pressable>
      </View>
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.largeIcon} accessible={false}>{article.icon}</Text>
        
        <Text style={styles.title} accessibilityRole="header">{article.title}</Text>
        
        <View 
          style={styles.sectionCard}
          accessible={true}
          accessibilityLabel={`真实案例：${article.case}`}
        >
          <Text style={styles.sectionLabel}>【真实案例】</Text>
          <Text style={styles.text}>{article.case}</Text>
        </View>

        <View 
          style={[styles.sectionCard, { backgroundColor: '#FFF3E0', borderLeftColor: '#FF9800' }]}
          accessible={true}
          accessibilityLabel={`防骗指南：${article.advice}`}
        >
          <Text style={[styles.sectionLabel, { color: '#E65100' }]}>【防骗指南】</Text>
          <Text style={styles.text}>{article.advice}</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable 
            style={styles.voiceBtn} 
            onPress={playVoice}
            accessibilityRole="button"
            accessibilityLabel="整页语音播报"
          >
            <Text style={styles.btnText}>🔊 语音播报</Text>
          </Pressable>

          {is96110Article && (
            <Pressable 
              style={styles.dialBtn} 
              onPress={handleCall96110}
              accessibilityRole="button"
              accessibilityLabel="一键拨打全国反诈专线 96110"
              accessibilityHint="按下后将拨打专线，请确认当前环境安全"
            >
              <Text style={styles.btnText}>📞 一键拨打</Text>
            </Pressable>
          )}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 🌟 全局自定义弹窗 */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 0.5, borderBottomColor: '#ddd' },
  backBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 15 },
  backIcon: { fontSize: 32, color: '#1976D2', fontWeight: '400', marginTop: -6, marginRight: 4 },
  backBtnText: { fontSize: 20, color: '#1976D2', fontWeight: '600' },
  content: { padding: 20 },
  largeIcon: { fontSize: 60, textAlign: 'center', marginBottom: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#D32F2F', textAlign: 'center', marginBottom: 25, lineHeight: 36 },
  sectionCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 20, borderLeftWidth: 6, borderLeftColor: '#D32F2F', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  sectionLabel: { fontSize: 20, fontWeight: 'bold', color: '#D32F2F', marginBottom: 12 },
  text: { fontSize: 18, color: '#222', lineHeight: 32 }, 
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 10 },
  voiceBtn: { flex: 1, backgroundColor: '#1976D2', padding: 18, borderRadius: 12, alignItems: 'center' },
  dialBtn: { flex: 1, backgroundColor: '#D32F2F', padding: 18, borderRadius: 12, alignItems: 'center' }, 
  btnText: { color: 'white', fontSize: 20, fontWeight: 'bold' }
});
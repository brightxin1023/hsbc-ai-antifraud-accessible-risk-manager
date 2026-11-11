import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

// 本地静态科普库：无需后端即可离线展示，避免列表页依赖网络拉取
export const ARTICLES = [
  { id: '1', icon: '🛡️', title: '绝不向陌生账户转账', summary: '公检法机关、银行客服绝对不会通过电话要求您转账。' },
  { id: '2', icon: '⚠️', title: '警惕“高回报”投资理财', summary: '凡是号称“稳赚不赔”、“日赚千元”的网络投资，100% 都是诈骗。' },
  { id: '3', icon: '📞', title: '遇到疑问请拨打 96110', summary: '遇到任何拿不准的电话或信息，请立刻挂断并拨打全国反诈专线。' },
  { id: '4', icon: '📦', title: '警惕“客服理赔”骗局', summary: '快递丢失、商品质量问题，正规客服绝不会要求您转账验证。' },
  { id: '5', icon: '💳', title: 'ETC/医保卡过期短信诈骗', summary: '带有陌生链接，要求填写银行卡密码的短信，都是钓鱼诈骗。' },
  { id: '6', icon: '💔', title: '警惕“杀猪盘”网恋投资', summary: '网恋对象只要提到“投资理财”、“带你赚钱”，100% 是诈骗。' },
  { id: '7', icon: '👔', title: '冒充领导/熟人借钱', summary: '熟人通过微信借钱，必须打电话核实，切勿仅凭文字转账。' },
  { id: '8', icon: '🎓', title: '注销校园贷/影响征信', summary: '个人征信由央行统一管理，任何人无权删除，不存在注销校园贷。' },
  { id: '9', icon: '💸', title: '刷单返利诈骗', summary: '所有要求垫资的刷单、点赞兼职都是诈骗，切勿贪小便宜。' },
  { id: '10', icon: '🔞', title: '裸聊敲诈勒索', summary: '千万不要和陌生人视频裸聊，不点不明链接，不下载不明APP。' }
];

/**
 * 科普列表页：展示本地反诈文章库，点击进入详情、旁路按钮触发真实语音播报。
 *
 * @param onSelectArticle 点击卡片后的回调，向全局回传选中的文章对象。
 */
export default function EduListScreen({ onSelectArticle }: { onSelectArticle: (article: any) => void }) {
  const playVoice = (title: string, content: string) => { 
    // 停止当前正在播放的语音
    Speech.stop();
    // 调用系统 TTS 进行真实朗读
    Speech.speak(`${title}。${content}`, {
      language: 'zh-CN',
      pitch: 1.0,
      rate: 0.9, // 稍微放慢语速，方便老年人听清
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBox}>
          <Text style={styles.pageTitle} accessibilityRole="header">反诈防骗小课堂</Text>
          <Text style={styles.pageSubtitle}>全民反诈，守护您的钱袋子</Text>
        </View>

        {ARTICLES.map((article) => {
          const isSpecial96110 = article.id === '3';

          return (
            <Pressable 
              key={article.id} 
              style={styles.card} 
              onPress={() => onSelectArticle(article)} 
              accessibilityRole="button" 
              accessibilityLabel={`${article.title}。${article.summary}`} 
              accessibilityHint="双击查看真实案例详情"
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon} accessible={false}>{article.icon}</Text>
                <Text style={styles.cardTitle}>{article.title}</Text>
              </View>
              <Text style={styles.cardSummary}>{article.summary}</Text>
              
              <View style={styles.cardFooter}>
                {/* 用嵌套 Text 只把“一键拨打”染红，突出 96110 特殊入口而非整行变色 */}
                <Text style={styles.readMore}>
                  {isSpecial96110 ? (
                    <>
                      查看详情与<Text style={styles.textRed}>一键拨打</Text> →
                    </>
                  ) : (
                    '查看详情 →'
                  )}
                </Text>
                
                <Pressable 
                  style={styles.voiceBtnSmall} 
                  onPress={(e) => { e.stopPropagation(); playVoice(article.title, article.summary); }} 
                  accessibilityRole="button" 
                  accessibilityLabel={`语音播报：${article.title}`}
                >
                  <Text style={styles.voiceBtnTextSmall}>🔊 语音播报</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  headerBox: { marginBottom: 20, alignItems: 'center' },
  pageTitle: { fontSize: 30, fontWeight: 'bold', color: '#D32F2F', marginBottom: 8 },
  pageSubtitle: { fontSize: 18, color: '#555' }, 
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: '#333333' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIcon: { fontSize: 32, marginRight: 10 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#000', flex: 1 },
  cardSummary: { fontSize: 18, color: '#333', lineHeight: 28, marginBottom: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readMore: { fontSize: 16, color: '#1565C0', fontWeight: 'bold' }, 
  textRed: { color: '#D32F2F' },
  voiceBtnSmall: { backgroundColor: '#E3F2FD', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
  voiceBtnTextSmall: { color: '#1565C0', fontSize: 18, fontWeight: 'bold' }, 
});
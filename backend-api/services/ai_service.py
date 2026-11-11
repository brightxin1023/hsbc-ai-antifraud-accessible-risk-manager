"""AI 研判服务：封装 DeepSeek 客户端、本地反诈知识库与两条 AI 能力。

- analyze_fraud_text: 对转账附言/可疑剧本做三级风险研判。
- answer_qa_question: 结合 scams.json 知识库做反诈问答。
"""
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com"
)

def load_knowledge_base():
    """加载本地诈骗剧本知识库；失败时降级为空列表，保证问答主流程不被文件异常打断。"""
    try:
        with open("scams.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"读取知识库失败: {e}")
        return []

def analyze_fraud_text(user_text: str):
    """对用户提交的转账附言/可疑剧本做三级风险研判。

    参数:
        user_text: 待研判文本。

    返回:
        dict: 包含 risk_level(high/medium/low)、scam_type 与 suggestion。
    """
    system_prompt = """
    你是一名拥有30年经验的国家反诈中心资深金融风控专家。你的任务是对用户提交的信息（可能是转账信息，如收款户名、转账金额、包括转账目的、备忘信息或对方话术在内的转账附言，也可能是收到的可疑短信/剧本）进行精准的金融风险研判。

    【风险等级判定标准（请严格按此逻辑，结合上下文语义进行判定）】

    一、判定为 high（高危，存在极高被诈骗风险）：
    1. 冒充公检法/政府机关：提及“安全账户”、“监管账户”、“资金清查”、“涉嫌洗钱/犯罪”、“保密不能告诉家人”。
    2. 刷单/做任务：提及“垫付”、“连单”、“充值解冻”、“佣金返还”。
    3. 杀猪盘/虚假投资：提及“稳赚不赔”、“内幕消息”、“跟着导师买”、“高回报理财”、“内部渠道”。
    4. 网贷/注销校园贷：提及“交解冻费”、“刷流水”、“注销网贷记录”、“影响征信”。
    5. 冒充客服/物流理赔：要求提供短信验证码、要求开启屏幕共享、退赔需要先转账。
    6. 裸聊敲诈/杀鱼盘：威胁发送不雅照片、索要封口费。
    7. 冒充领导/熟人紧急借钱：要求立即转账、正在开会/不方便接电话、换个账户打款。
    8. 涉黑灰产：给陌生人转账用于“解封微信号”、“游戏账号私下高价交易”、“跑分洗钱”。

    二、判定为 medium（中危，具有明显疑点但信息不绝对）：
    1. 可疑链接/钓鱼类：点击不明链接办理ETC、医保卡停用、社保升级、积分兑换。
    2. 疑似盗号借钱：久未联系的同学/亲戚/朋友，突然发信息借钱，且语气与往常不符，或不愿语音通话。
    3. 边缘违规交易：推销高价且包治百病的保健品、算命/转运、黄牛代抢。
    4. 异常兼职：只需线上打字、点赞、刷好评，但要求先交小额押金或培训费。
    5. 陌生异性交友：网恋初期，对方提出借钱交房租、买礼物，或推荐投资平台。
    6. 己方可疑用途（易涉诈场景）：备注为“给网友转账”、“给游戏好友买礼物”、“兼职交押金”、“做任务垫付本金”、“购买非正规渠道低价商品”。即便用户认为自己是自愿的，也存在极高被骗风险。
    7. 身份不符的转账：备注为“交学费/生活费”，但收款方为陌生的个人账户（非学校公户或亲属）。

    三、判定为 low（低危，正常合理的交易场景）：
    1. 日常消费：外卖、超市购物、话费充值、水电煤缴费。
    2. 亲友往来：给明确备注为父母、子女、配偶的熟人转账，且金额合理，用途明确（如生活费、学费、交医药费）。
    3. 正规商业往来：支付房租、物业费、工资发放、正规电商平台购物。
    4. 己方合理用途：备注为明确的日常消费（如“买电脑”、“还信用卡”、“AA聚餐”），且收款方无异常特征。

    【特别注意的心理学风控特征】
    如果对话中包含“制造恐慌（你被通缉了）”、“制造紧迫感（半小时内不转就封号）”、“要求保密（别告诉任何人）”、“脱离正规平台（加微信私聊、点链接下载APP）”等典型话术，请直接提升风险等级。

    【输出要求】
    你必须且只能返回一个合法的 JSON 对象。不要包含任何 Markdown 标记，不要包含任何多余的解释废话。
    输出格式如下：
    {"risk_level": "high或medium或low", "scam_type": "诈骗类型", "suggestion": "防范建议"}

    - risk_level：必须是 high, medium, low 三选一。
    - scam_type：根据风险判定，精准指出类型（如：冒充公检法、刷单诈骗、钓鱼链接、熟人借款、疑似网恋骗局、异常商业交易、无等）。
    - suggestion：用简短、易懂、有同理心的大白话给出建议，不超过30个字。
    """
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_text}],
            # 强制 JSON 输出 + 低温采样：保证返回可被 json.loads 稳定解析、风险等级不漂移
            response_format={"type": "json_object"},
            temperature=0.1
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        # AI 调用异常时降级兜底，避免模型故障直接拖垮转账主流程
        return {"risk_level": "low", "scam_type": "无", "suggestion": f"系统错误:{str(e)}"}

def answer_qa_question(user_query: str):
    """反诈问答：先用本地知识库关键词命中剧本，再交给 AI 用大白话组织答案。

    参数:
        user_query: 用户提问。

    返回:
        str: AI 组织后的回答；异常时返回可读的错误提示。
    """
    kb = load_knowledge_base()
    matched_info = "暂无匹配的明确诈骗剧本。"
    # 先做本地关键词命中：给 AI 提供确定性依据，避免“空口回答”带来的不稳定
    for item in kb:
        if any(kw in user_query for kw in item["keywords"]):
            matched_info = f"【匹配剧本】: {item['type']}\n【套路说明】: {item['description']}\n【防骗建议】: {item['advice']}"
            break
            
    system_prompt = f"你是反诈AI。请结合以下知识，用大白话回答，不超过150字：\n{matched_info}"
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_query}],
            # 比研判接口略高的温度，让口语化建议更自然，同时保持答案不跑题
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"抱歉，系统繁忙: {str(e)}"
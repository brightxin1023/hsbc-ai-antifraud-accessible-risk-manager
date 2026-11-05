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
    try:
        with open("scams.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"读取知识库失败: {e}")
        return []

def analyze_fraud_text(user_text: str):
    system_prompt = """
    你是一名拥有10年经验的国家反诈中心资深金融风控专家，精通各类电信网络诈骗话术与心理学套路。

    【任务说明】
    请深度分析用户输入的文本（可能是聊天记录、短信或转账附言），判断其是否涉嫌诈骗。

    【风险等级判定标准】
    - high（高危）：包含典型的诈骗闭环特征。例如：要求转账至“安全账户”、索要短信验证码、要求开启屏幕共享、承诺“稳赚不赔”的高额返利、网恋对象诱导投资、冒充公检法/客服要求资金审查。
    - medium（中危）：具有高度疑似特征，但信息不完整。例如：陌生链接要求填写个人信息、兼职群要求先垫付小额资金、自称熟人要求借钱但未提供更多信息。
    - low（低危）：正常的日常社交、生活转账、薪资发放或明确的亲友借贷。

    【输出要求】
    1. 你必须且只能返回一个合法的 JSON 对象，不要包含任何 Markdown 格式（如 ```json）或其他废话。
    2. JSON 键名必须严格遵守：risk_level, scam_type, suggestion。
    3. scam_type 字段：如果是诈骗，请精准指出诈骗类型（如：ETC过期诈骗、冒充公检法、杀猪盘、刷单返利,等等）；如果安全，则填"无"。
    4. suggestion 字段：用简短的大白话给出防范建议（不超过30字）。

    输出示例：
    {"risk_level": "high", "scam_type": "冒充公检法", "suggestion": "立刻停止转账，公检法绝不会要求转入安全账户"}
    """
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_text}],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"risk_level": "low", "scam_type": "无", "suggestion": f"系统错误:{str(e)}"}

def answer_qa_question(user_query: str):
    kb = load_knowledge_base()
    matched_info = "暂无匹配的明确诈骗剧本。"
    for item in kb:
        if any(kw in user_query for kw in item["keywords"]):
            matched_info = f"【匹配剧本】: {item['type']}\n【套路说明】: {item['description']}\n【防骗建议】: {item['advice']}"
            break
            
    system_prompt = f"你是反诈AI。请结合以下知识，用大白话回答，不超过150字：\n{matched_info}"
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_query}],
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"抱歉，系统繁忙: {str(e)}"
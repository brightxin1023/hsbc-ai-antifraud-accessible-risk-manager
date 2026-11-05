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
    你是一个专业的金融反诈AI。请分析用户输入的文本，判断是否属于诈骗。
    常见的诈骗剧本包括：1.冒充公检法 2.杀猪盘理财 3.刷单诈骗。
    你必须且只能返回一个 JSON 格式，格式如下：
    {"risk_level": "high 或 low", "scam_type": "诈骗类型", "suggestion": "建议动作"}
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
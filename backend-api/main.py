import os
import json
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv() # 加载 .env 文件
client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com"
)

class Transaction(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "AI 反诈盾后端启动成功"}

@app.post("/api/detect")
def detect_fraud(transaction: Transaction):
    user_text = transaction.text
    
    system_prompt = """
    你是一个专业的金融反诈AI。请分析用户输入的文本，判断是否属于诈骗。
    常见的诈骗剧本包括：
    1. 冒充公检法：说你涉嫌洗钱、要求转入安全账户。
    2. 杀猪盘：网恋推荐投资理财、高回报。
    3. 刷单诈骗：点赞赚佣金、垫付资金。

    你必须且只能返回一个 JSON 格式，不要包含任何其他废话。格式如下：
    {
        "risk_level": "high 或 low",
        "scam_type": "诈骗类型（如冒充公检法/杀猪盘/无）",
        "suggestion": "给用户的建议动作"
    }
    """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat", 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_text}
            ],
            response_format={ "type": "json_object" },
            temperature=0.1
        )
        
        result_text = response.choices[0].message.content
        import json
        return json.loads(result_text)
        
    except Exception as e:
        # 如果报错，降级为简单规则
        if "安全账户" in user_text or "洗钱" in user_text:
            return {"risk_level": "high", "scam_type": "冒充公检法", "suggestion": "立即拦截交易"}
        return {"risk_level": "low", "scam_type": "无", "suggestion": f"系统错误:{str(e)}"}

    # --- 以下是 RAG 问答接口 ---

def load_knowledge_base():
    try:
        with open("scams.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"读取知识库失败: {e}")
        return []

class Question(BaseModel):
    query: str

@app.post("/api/qa")
def answer_question(question: Question):
    user_query = question.query
    kb = load_knowledge_base()
    
    # 简易 RAG 检索：根据关键词匹配
    matched_info = "暂无匹配的明确诈骗剧本。"
    for item in kb:
        if any(kw in user_query for kw in item["keywords"]):
            matched_info = f"【匹配剧本】: {item['type']}\n【套路说明】: {item['description']}\n【防骗建议】: {item['advice']}"
            break
            
    system_prompt = f"""
    你是一个专业的反诈AI助手，专门为老年人及残障人士解答问题。
    请用简单、易懂的大白话回答用户的问题。
    以下是系统为你检索到的相关诈骗知识：
    {matched_info}
    
    请结合上述知识，用富有同理心的语气回答用户，不要超过150个字。
    """
    
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ],
            temperature=0.3
        )
        return {"answer": response.choices[0].message.content}
    except Exception as e:
        return {"answer": f"抱歉，系统繁忙，请稍后再试。错误信息: {str(e)}"}
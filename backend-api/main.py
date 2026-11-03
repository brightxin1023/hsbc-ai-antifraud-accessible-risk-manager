from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⚠️ 替换成你的 DeepSeek API Key
client = OpenAI(
    api_key="sk-a5184d7e0b124eb9a47d6a68cbf06478", 
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
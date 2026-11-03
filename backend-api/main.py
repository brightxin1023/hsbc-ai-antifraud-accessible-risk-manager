from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "AI反诈盾后端服务启动成功！"}
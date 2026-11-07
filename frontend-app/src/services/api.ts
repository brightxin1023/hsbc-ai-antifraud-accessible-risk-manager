export const BASE_URL = 'http://172.20.10.3:8000'; 

export const detectFraudApi = async (text: string) => {
  const response = await fetch(`${BASE_URL}/api/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return response.json();
};

export const askQuestionApi = async (query: string) => {
  const response = await fetch(`${BASE_URL}/api/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return response.json();
};

export const alertFamilyApi = async (text: string, scam_type: string, user_phone: string) => {
  const response = await fetch(`${BASE_URL}/api/alert/family`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, scam_type, user_phone }),
  });
  return response.json();
};

export const registerApi = async (phone: string, password: string) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "注册失败");
  return data;
};

export const loginApi = async (phone: string, password: string) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "登录失败");
  return data;
};

export const getVoiceHintApi = async (phone: string) => {
  const response = await fetch(`${BASE_URL}/api/auth/voice_hint?phone=${phone}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "获取语音提示失败");
  return data; // 返回 { hint: "20__" }
};
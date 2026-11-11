// 真机联调时指向后端宿主机 IP；模拟器可改用 localhost，改这里即可全局切换
export const BASE_URL = 'http://172.20.10.3:8000'; 

/**
 * 涉诈剧本/转账文本检测。
 * @param text 待研判文本。
 * @returns 后端返回的 {risk_level, scam_type, suggestion}。
 */
export const detectFraudApi = async (text: string) => {
  const response = await fetch(`${BASE_URL}/api/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return response.json();
};

/**
 * 反诈智能问答。
 * @param query 用户提问。
 * @returns 后端返回的 {answer}。
 */
export const askQuestionApi = async (query: string) => {
  const response = await fetch(`${BASE_URL}/api/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return response.json();
};

/**
 * 家属告警：高危阻断/紧急求助时通知紧急联系人。
 * @param email 紧急联系人邮箱；为空时后端回退默认测试邮箱。
 * @returns 后端发送结果。
 */
export const alertFamilyApi = async (text: string, scam_type: string, user_phone: string, email: string) => {
  const response = await fetch(`${BASE_URL}/api/alert/family`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, scam_type, user_phone, email }),
  });
  return response.json();
};

/**
 * 注册；后端返回非 2xx 时抛出 detail 信息供前端展示。
 * @param phone 手机号。
 * @param password 6 位数字密码。
 */
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

/**
 * 登录；后端返回非 2xx 时抛出 detail 信息供前端展示。
 * @param phone 手机号。
 * @param password 6 位数字密码。
 */
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

/**
 * 获取密码语音提示掩码（如 "20__"），用于声纹动态口令登录。
 * @param phone 手机号。
 * @returns {hint} 掩码后的密码提示。
 */
export const getVoiceHintApi = async (phone: string) => {
  const response = await fetch(`${BASE_URL}/api/auth/voice_hint?phone=${phone}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "获取语音提示失败");
  return data;
};
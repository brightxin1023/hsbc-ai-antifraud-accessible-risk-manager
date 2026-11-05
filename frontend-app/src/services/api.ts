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

export const alertFamilyApi = async (text: string, scam_type: string) => {
  const response = await fetch(`${BASE_URL}/api/alert/family`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, scam_type }),
  });
  return response.json();
};
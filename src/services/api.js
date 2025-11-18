const BASE_URL = 'https://ai-test-3gix.onrender.com';

// بررسی سلامت بک‌اند
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${BASE_URL}/health/ping`);
    if (!response.ok) throw new Error('Backend not responding');
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// ارسال پیام چت
export const sendChatMessage = async (message, userId = 'anonymous', sessionId = null) => {
  try {
    const response = await fetch(`${BASE_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        user_id: userId,
        session_id: sessionId
      })
    });

    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

// دریافت پیشنهادات
export const getChatSuggestions = async (userId = 'anonymous') => {
  try {
    const response = await fetch(`${BASE_URL}/chat/suggestions?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to get suggestions');
    return await response.json();
  } catch (error) {
    console.error('Get suggestions error:', error);
    throw error;
  }
};

// دریافت تاریخچه چت
export const getChatHistory = async (sessionId, limit = 20) => {
  try {
    const response = await fetch(`${BASE_URL}/chat/history?session_id=${sessionId}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get history');
    return await response.json();
  } catch (error) {
    console.error('Get history error:', error);
    throw error;
  }
};

// APIهای دیگر
export const getCoinsList = async (limit = 20) => {
  try {
    const response = await fetch(`${BASE_URL}/coins/list?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get coins');
    return await response.json();
  } catch (error) {
    console.error('Get coins error:', error);
    throw error;
  }
};

export const getNews = async (limit = 10) => {
  try {
    const response = await fetch(`${BASE_URL}/news/all?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get news');
    return await response.json();
  } catch (error) {
    console.error('Get news error:', error);
    throw error;
  }
};

export const getFearGreedIndex = async () => {
  try {
    const response = await fetch(`${BASE_URL}/insights/fear-greed`);
    if (!response.ok) throw new Error('Failed to get fear-greed index');
    return await response.json();
  } catch (error) {
    console.error('Get fear-greed error:', error);
    throw error;
  }
};

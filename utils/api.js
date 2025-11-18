const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // متدهای چت
  async sendMessage(message, userId, sessionId = null) {
    return this.request('/api/chat/send', {
      method: 'POST',
      body: {
        message,
        user_id: userId,
        session_id: sessionId
      }
    });
  }

  async getChatHistory(sessionId, limit = 50) {
    return this.request(`/api/chat/history?session_id=${sessionId}&limit=${limit}`);
  }

  async getUserSessions(userId, limit = 10) {
    return this.request(`/api/chat/sessions?user_id=${userId}&limit=${limit}`);
  }

  async deleteSession(sessionId) {
    return this.request(`/api/chat/sessions/${sessionId}`, {
      method: 'DELETE'
    });
  }

  async getSuggestions(userId = 'anonymous') {
    return this.request(`/api/chat/suggestions?user_id=${userId}`);
  }

  // متدهای سلامت سیستم
  async getSystemHealth() {
    return this.request('/api/health/status?detail=full');
  }

  async getCacheStatus() {
    return this.request('/api/health/cache?view=status');
  }

  // متدهای بازار
  async getCoinPrice(coinId) {
    return this.request(`/api/coins/details/${coinId}`);
  }

  async getFearGreedIndex() {
    return this.request('/api/insights/fear-greed');
  }

  async getNews(limit = 10) {
    return this.request(`/api/news/all?limit=${limit}`);
  }
}

export const apiClient = new ApiClient();

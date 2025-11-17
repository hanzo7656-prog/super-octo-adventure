const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-test-3gix.onrender.com'

class HealthAPI {
  async request(endpoint, options = {}) {
    try {
      const url = `${BASE_URL}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // سلامت پایه
  async getStatus(detail = 'basic') {
    return this.request(`/api/health/status?detail=${detail}`)
  }

  async getHealthScore() {
    return this.request('/api/health/status?detail=score')
  }

  async getFullStatus() {
    return this.request('/api/health/status?detail=full')
  }

  // سیستم کش
  async getCacheStatus(view = 'status') {
    return this.request(`/api/health/cache?view=${view}`)
  }

  // هشدارها
  async getAlerts() {
    return this.request('/api/health/debug?view=alerts')
  }

  // متریک‌ها
  async getMetrics(type = 'all') {
    return this.request(`/api/health/metrics?type=${type}`)
  }

  // کارگران
  async getWorkersStatus() {
    return this.request('/api/health/workers?metric=status')
  }

  // پاک‌سازی
  async runCleanup() {
    return this.request('/api/health/cleanup?action=urgent', { method: 'POST' })
  }
}

class CoinsAPI {
  async getCoinsList(params = {}) {
    const query = new URLSearchParams(params).toString()
    return fetch(`${BASE_URL}/api/coins/list?${query}`).then(r => r.json())
  }

  async getCoinDetails(coinId) {
    return fetch(`${BASE_URL}/api/coins/details/${coinId}`).then(r => r.json())
  }
}

class NewsAPI {
  async getNews(limit = 10) {
    return fetch(`${BASE_URL}/api/news/all?limit=${limit}`).then(r => r.json())
  }
}

export const healthAPI = new HealthAPI()
export const coinsAPI = new CoinsAPI()
export const newsAPI = new NewsAPI()
export default {
  health: healthAPI,
  coins: coinsAPI,
  news: newsAPI,
}

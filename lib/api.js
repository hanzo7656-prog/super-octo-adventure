// lib/api.js
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

  // لیست نمادها
  async getCoinsList(params = {}) {
    const {
      limit = 20,
      page = 1,
      currency = 'USD',
      sort_by = 'rank',
      sort_dir = 'asc',
      coin_ids,
      name,
      symbol,
      blockchains,
      categories
    } = params;

    const queryParams = new URLSearchParams({
      limit,
      page,
      currency,
      sort_by,
      sort_dir,
      ...(coin_ids && { coin_ids }),
      ...(name && { name }),
      ...(symbol && { symbol }),
      ...(blockchains && { blockchains }),
      ...(categories && { categories })
    });

    return this.request(`/api/coins/list?${queryParams}`)
  }

  // جزئیات نماد
  async getCoinDetails(coinId, currency = 'USD') {
    return this.request(`/api/coins/details/${coinId}?currency=${currency}`)
  }

  // داده‌های چارت نماد
  async getCoinCharts(coinId, period = '1w') {
    return this.request(`/api/coins/charts/${coinId}?period=${period}`)
  }

  // قیمت متوسط تاریخی
  async getCoinPriceAvg(coinId = 'bitcoin', timestamp = '1636315200') {
    return this.request(`/api/coins/price/avg?coin_id=${coinId}&timestamp=${timestamp}`)
  }

  // داده‌های خام نمادها
  async getRawCoinsList(params = {}) {
    const {
      limit = 20,
      page = 1,
      currency = 'USD',
      sort_by = 'rank',
      sort_dir = 'asc',
      coin_ids,
      name,
      symbol,
      blockchains,
      categories
    } = params;

    const queryParams = new URLSearchParams({
      limit,
      page,
      currency,
      sort_by,
      sort_dir,
      ...(coin_ids && { coin_ids }),
      ...(name && { name }),
      ...(symbol && { symbol }),
      ...(blockchains && { blockchains }),
      ...(categories && { categories })
    });

    return this.request(`/api/raw/coins/list?${queryParams}`)
  }

  // جزئیات خام نماد
  async getRawCoinDetails(coinId, currency = 'USD', includeRiskScore = false) {
    return this.request(`/api/raw/coins/details/${coinId}?currency=${currency}&include_risk_score=${includeRiskScore}`)
  }

  // چارت خام نماد
  async getRawCoinCharts(coinId, period = 'all') {
    return this.request(`/api/raw/coins/charts/${coinId}?period=${period}`)
  }

  // چارت چندنماد
  async getRawMultiCharts(coinIds, period = 'all') {
    return this.request(`/api/raw/coins/multi-charts?coin_ids=${coinIds}&period=${period}`)
  }

  // متادیتای کوین‌ها
  async getCoinsMetadata() {
    return this.request('/api/raw/coins/metadata')
  }
}

class NewsAPI {
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

  // اخبار عمومی
  async getNews(limit = 50, page = 1) {
    return this.request(`/api/news/all?limit=${limit}&page=${page}`)
  }

  // اخبار بر اساس نوع
  async getNewsByType(newsType, limit = 10) {
    const validTypes = ['handpicked', 'trending', 'latest', 'bullish', 'bearish'];
    if (!validTypes.includes(newsType)) {
      throw new Error(`Invalid news type. Valid types: ${validTypes.join(', ')}`);
    }

    return this.request(`/api/news/type/${newsType}?limit=${limit}`)
  }

  // منابع خبری
  async getNewsSources() {
    return this.request('/api/news/sources')
  }

  // جزئیات خبر
  async getNewsDetail(newsId) {
    return this.request(`/api/news/detail/${newsId}`)
  }

  // دسته‌بندی‌های خبر
  async getNewsCategories() {
    return this.request('/api/news/categories')
  }

  // جستجو در اخبار
  async searchNews(query, limit = 20) {
    return this.request(`/api/news/search?query=${encodeURIComponent(query)}&limit=${limit}`)
  }

  // آمار اخبار
  async getNewsStats() {
    return this.request('/api/news/stats')
  }

  // داده‌های خام اخبار
  async getRawNews(limit = 50) {
    return this.request(`/api/raw/news/all?limit=${limit}`)
  }

  // داده‌های خام اخبار دسته‌بندی شده
  async getRawNewsByType(newsType, limit = 10) {
    return this.request(`/api/raw/news/type/${newsType}?limit=${limit}`)
  }

  // داده‌های خام منابع خبری
  async getRawNewsSources() {
    return this.request('/api/raw/news/sources')
  }

  // داده‌های خام جزئیات خبر
  async getRawNewsDetail(newsId) {
    return this.request(`/api/raw/news/detail/${newsId}`)
  }

  // تحلیل احساسات اخبار
  async getNewsSentimentAnalysis(limit = 20, newsType = null) {
    const params = new URLSearchParams({ limit });
    if (newsType) {
      params.append('news_type', newsType);
    }

    return this.request(`/api/raw/news/sentiment-analysis?${params}`)
  }

  // متادیتای اخبار
  async getNewsMetadata() {
    return this.request('/api/raw/news/metadata')
  }
}

class InsightsAPI {
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

  // شاخص ترس و طمع
  async getFearGreed() {
    return this.request('/api/insights/fear-greed')
  }

  // چارت ترس و طمع
  async getFearGreedChart() {
    return this.request('/api/insights/fear-greed/chart')
  }

  // دامیننس بیت‌کوین
  async getBTCDominance(type = 'all') {
    return this.request(`/api/insights/btc-dominance?type=${type}`)
  }

  // چارت رنگین‌کمان
  async getRainbowChart(coinId) {
    return this.request(`/api/insights/rainbow-chart/${coinId}`)
  }

  // داده‌های خام دامیننس
  async getRawBTCDominance(type = 'all') {
    return this.request(`/api/raw/insights/btc-dominance?type=${type}`)
  }

  // داده‌های خام ترس و طمع
  async getRawFearGreed() {
    return this.request('/api/raw/insights/fear-greed')
  }

  // داده‌های خام چارت ترس و طمع
  async getRawFearGreedChart() {
    return this.request('/api/raw/insights/fear-greed/chart')
  }

  // داده‌های خام چارت رنگین‌کمان
  async getRawRainbowChart(coinId) {
    return this.request(`/api/raw/insights/rainbow-chart/${coinId}`)
  }

  // تحلیل جامع بازار
  async getMarketAnalysis() {
    return this.request('/api/raw/insights/market-analysis')
  }

  // متادیتای بینش‌ها
  async getInsightsMetadata() {
    return this.request('/api/raw/insights/metadata')
  }
}

class ExchangesAPI {
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

  // لیست صرافی‌ها
  async getExchangesList() {
    return this.request('/api/exchanges/list')
  }

  // مارکت‌ها
  async getMarkets() {
    return this.request('/api/exchanges/markets')
  }

  // ارزهای فیات
  async getFiats() {
    return this.request('/api/exchanges/fiats')
  }

  // ارزها
  async getCurrencies() {
    return this.request('/api/exchanges/currencies')
  }

  // قیمت صرافی
  async getExchangePrice(exchange = 'Binance', fromCoin = 'BTC', toCoin = 'USDT', timestamp = null) {
    const params = new URLSearchParams({ exchange, from_coin: fromCoin, to_coin: toCoin });
    if (timestamp) {
      params.append('timestamp', timestamp);
    }

    return this.request(`/api/exchanges/price?${params}`)
  }

  // داده‌های خام صرافی‌ها
  async getRawExchangesList() {
    return this.request('/api/raw/exchanges/list')
  }

  // داده‌های خام مارکت‌ها
  async getRawMarkets() {
    return this.request('/api/raw/exchanges/markets')
  }

  // داده‌های خام ارزهای فیات
  async getRawFiats() {
    return this.request('/api/raw/exchanges/fiats')
  }

  // داده‌های خام ارزها
  async getRawCurrencies() {
    return this.request('/api/raw/exchanges/currencies')
  }

  // متادیتای صرافی‌ها
  async getExchangesMetadata() {
    return this.request('/api/raw/exchanges/metadata')
  }
}

class DocsAPI {
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

  // مستندات کامل
  async getCompleteDocs() {
    return this.request('/api/docs/complete')
  }

  // مستندات کوین‌ها
  async getCoinsDocs() {
    return this.request('/api/docs/coins')
  }

  // مثال‌های کد
  async getCodeExamples() {
    return this.request('/api/docs/examples')
  }
}

export const healthAPI = new HealthAPI()
export const coinsAPI = new CoinsAPI()
export const newsAPI = new NewsAPI()
export const insightsAPI = new InsightsAPI()
export const exchangesAPI = new ExchangesAPI()
export const docsAPI = new DocsAPI()

export default {
  health: healthAPI,
  coins: coinsAPI,
  news: newsAPI,
  insights: insightsAPI,
  exchanges: exchangesAPI,
  docs: docsAPI,
}

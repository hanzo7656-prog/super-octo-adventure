// pages/news.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { newsAPI } from '../lib/api'

export default function NewsPage() {
  const [news, setNews] = useState([])
  const [filteredNews, setFilteredNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', name: 'همه اخبار', icon: '📰' },
    { id: 'handpicked', name: 'منتخب', icon: '⭐' },
    { id: 'trending', name: 'داغ', icon: '🔥' },
    { id: 'latest', name: 'آخرین', icon: '🆕' },
    { id: 'bullish', name: 'مثبت', icon: '📈' },
    { id: 'bearish', name: 'منفی', icon: '📉' }
  ]

  useEffect(() => {
    loadNews()
  }, [selectedCategory])

  useEffect(() => {
    filterNews()
  }, [news, searchTerm])

  const loadNews = async () => {
    try {
      setIsLoading(true)
      let data
      
      if (selectedCategory === 'all') {
        data = await newsAPI.getNews(50)
      } else {
        data = await newsAPI.getNewsByType(selectedCategory, 50)
      }
      
      setNews(data.data || [])
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterNews = () => {
    if (!searchTerm) {
      setFilteredNews(news)
      return
    }
    
    const filtered = news.filter(item => 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    setFilteredNews(filtered)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSentimentIcon = (title, description) => {
    const text = (title + ' ' + description).toLowerCase()
    if (text.includes('bullish') || text.includes('صعود') || text.includes('رشد')) return '📈'
    if (text.includes('bearish') || text.includes('نزول') || text.includes('افت')) return '📉'
    return '📊'
  }

  return (
    <div className="page-container">
      <Head>
        <title>اخبار بازار کریپتو - VortexAI</title>
        <meta name="description" content="آخرین اخبار و تحلیل‌های بازار ارزهای دیجیتال" />
      </Head>

      <header className="page-header">
        <div className="header-content">
          <h1>📰 اخبار بازار کریپتو</h1>
          <p>آخرین اخبار، تحلیل‌ها و رویدادهای بازار ارزهای دیجیتال</p>
        </div>
        
        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="جستجو در اخبار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button onClick={loadNews} className="refresh-btn">
            🔄 بروزرسانی
          </button>
        </div>
      </header>

      {/* دسته‌بندی‌ها */}
      <nav className="categories-nav">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </nav>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner">🌀</div>
          <p>در حال بارگذاری اخبار...</p>
        </div>
      ) : (
        <>
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-label">تعداد اخبار:</span>
              <span className="stat-value">{filteredNews.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">دسته‌بندی:</span>
              <span className="stat-value">
                {categories.find(c => c.id === selectedCategory)?.name}
              </span>
            </div>
          </div>

          <div className="news-list">
            {filteredNews.map(item => (
              <article key={item.id} className="news-item">
                <div className="news-content">
                  <div className="news-header">
                    <div className="sentiment-icon">
                      {getSentimentIcon(item.title, item.description)}
                    </div>
                    <h3 className="news-title">{item.title}</h3>
                  </div>
                  
                  <p className="news-description">
                    {item.description || 'توضیحات در دسترس نیست...'}
                  </p>
                  
                  <div className="news-meta">
                    <div className="meta-item">
                      <span className="meta-label">منبع:</span>
                      <span className="meta-value">{item.source || 'ناشناس'}</span>
                    </div>
                    
                    <div className="meta-item">
                      <span className="meta-label">تاریخ:</span>
                      <span className="meta-value">
                        {item.published_at ? formatDate(item.published_at) : 'نامشخص'}
                      </span>
                    </div>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="meta-item">
                        <span className="meta-label">برچسب‌ها:</span>
                        <div className="tags">
                          {item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="news-actions">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      مطالعه کامل
                    </a>
                    <button className="btn-outline">
                      ذخیره
                    </button>
                  </div>
                </div>
                
                {item.image_url && (
                  <div className="news-image-container">
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="news-image"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
          
          {filteredNews.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>خبری یافت نشد</h3>
              <p>لطفاً دسته‌بندی یا عبارت جستجو را تغییر دهید</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

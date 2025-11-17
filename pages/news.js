import { useState, useEffect } from 'react'
import Head from 'next/head'
import { newsAPI } from '../lib/api'

export default function NewsPage() {
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      const data = await newsAPI.getNews(20)
      setNews(data.data || [])
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="news-container">
      <Head>
        <title>اخبار کریپتو - VortexAI</title>
      </Head>

      <header className="page-header">
        <h1>📰 اخبار بازار کریپتو</h1>
      </header>

      {isLoading ? (
        <div className="loading">در حال بارگذاری اخبار...</div>
      ) : (
        <div className="news-list">
          {news.map(item => (
            <article key={item.id} className="news-item">
              <div className="news-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="news-meta">
                  <span>منبع: {item.source}</span>
                  <span>•</span>
                  <span>{new Date(item.published_at).toLocaleString('fa-IR')}</span>
                </div>
              </div>
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="news-image" />
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

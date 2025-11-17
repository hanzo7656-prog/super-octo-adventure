import { useState, useEffect } from 'react'
import Head from 'next/head'
import { coinsAPI } from '../lib/api'

export default function CoinsPage() {
  const [coins, setCoins] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCoins()
  }, [])

  const loadCoins = async () => {
    try {
      const data = await coinsAPI.getCoinsList({ limit: 50 })
      setCoins(data.data || [])
    } catch (error) {
      console.error('Error loading coins:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="coins-container">
      <Head>
        <title>نمادهای ارز دیجیتال - VortexAI</title>
      </Head>

      <header className="page-header">
        <h1>💰 نمادهای ارز دیجیتال</h1>
      </header>

      {isLoading ? (
        <div className="loading">در حال بارگذاری...</div>
      ) : (
        <div className="coins-grid">
          {coins.map(coin => (
            <div key={coin.id} className="coin-card">
              <div className="coin-header">
                <h3>{coin.name}</h3>
                <span className="coin-symbol">{coin.symbol}</span>
              </div>
              <div className="coin-price">
                ${coin.price?.toLocaleString()}
              </div>
              <div className={`coin-change ${coin.price_change_24h >= 0 ? 'positive' : 'negative'}`}>
                {coin.price_change_24h >= 0 ? '📈' : '📉'} 
                {Math.abs(coin.price_change_24h)}%
              </div>
              <div className="coin-stats">
                <div>ارزش بازار: ${(coin.market_cap / 1e9).toFixed(2)}B</div>
                <div>حجم: ${(coin.volume_24h / 1e6).toFixed(1)}M</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import ChatInterface from '../components/ChatInterface'
import MonitoringDashboard from '../components/MonitoringDashboard'
import StatusCards from '../components/StatusCards'
import ResourceMonitor from '../components/ResourceMonitor'
import { healthAPI } from '../lib/api'

export default function Home() {
  const [systemStatus, setSystemStatus] = useState(null)
  const [realTimeData, setRealTimeData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('chat')

  useEffect(() => {
    loadInitialData()
    const interval = setInterval(loadRealTimeData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadInitialData = async () => {
    try {
      const [status, health] = await Promise.all([
        healthAPI.getStatus('basic'),
        healthAPI.getHealthScore()
      ])
      setSystemStatus(status)
      setRealTimeData(health)
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRealTimeData = async () => {
    try {
      const data = await healthAPI.getStatus('basic')
      setRealTimeData(data)
    } catch (error) {
      console.error('Error loading real-time data:', error)
    }
  }

  return (
    <div className="app-container">
      <Head>
        <title>VortexAI Monitor - سیستم مانیتورینگ هوشمند</title>
        <meta name="description" content="سیستم مانیتورینگ پیشرفته VortexAI" />
      </Head>

      {/* هدر شبیه DeepSeek */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">🌀</div>
            <h1>VortexAI Monitor</h1>
          </div>
          <div className="header-stats">
            {realTimeData && (
              <>
                <div className="stat-item">
                  <span className="stat-label">سلامت</span>
                  <span className={`stat-value ${realTimeData.health_score > 80 ? 'healthy' : 'warning'}`}>
                    {realTimeData.health_score}%
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">کش</span>
                  <span className="stat-value">
                    {realTimeData.services?.cache ? '🟢' : '🔴'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* تب‌های اصلی */}
      <nav className="main-nav">
        <button 
          className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 گفتگو
        </button>
        <button 
          className={`nav-tab ${activeTab === 'monitor' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitor')}
        >
          📊 مانیتور
        </button>
        <button 
          className={`nav-tab ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          ⚡ منابع
        </button>
      </nav>

      {/* محتوای اصلی */}
      <main className="main-content">
        {activeTab === 'chat' && (
          <div className="chat-section">
            <ChatInterface />
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="monitor-section">
            <StatusCards data={realTimeData} />
            <MonitoringDashboard />
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="resources-section">
            <ResourceMonitor data={realTimeData} />
          </div>
        )}
      </main>

      {/* فوتر */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>VortexAI Monitor v4.0.0</span>
          <span>•</span>
          <span>Status: {systemStatus?.status === 'healthy' ? '🟢 عملیاتی' : '🔴 اختلال'}</span>
          <span>•</span>
          <span>آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}</span>
        </div>
      </footer>
    </div>
  )
}

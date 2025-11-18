import { useState, useEffect } from 'react'
import Head from 'next/head'
import ChatInterface from '../components/ChatInterface'
import MonitoringDashboard from '../components/MonitoringDashboard'
import StatusCards from '../components/StatusCards'
import ResourceMonitor from '../components/ResourceMonitor'
import HamburgerMenu from '../components/HamburgerMenu'
import { healthAPI } from '../lib/api'

export default function Home() {
  const [systemStatus, setSystemStatus] = useState(null)
  const [realTimeData, setRealTimeData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('chat')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setIsMenuOpen(false) // بستن منو بعد از انتخاب تب
  }

  return (
    <div className="app-container">
      <Head>
        <title>VortexAI Monitor - سیستم مانیتورینگ هوشمند</title>
        <meta name="description" content="سیستم مانیتورینگ پیشرفته VortexAI" />
      </Head>

      {/* هدر با منوی همبرگر */}
      <header className="app-header">
        <div className="header-content">
          <button 
            className="hamburger-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="منو"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          
          <div className="logo-section">
            <div className="logo">VortexAI</div>
            <h1 className="header-title">Monitor</h1>
          </div>
          
          <div className="header-stats">
            {realTimeData && (
              <div className="status-indicator">
                <span className={`status-dot ${realTimeData.health_score > 80 ? 'healthy' : 'warning'}`}></span>
                <span className="status-text">
                  سلامت: {realTimeData.health_score}%
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* منوی همبرگر */}
      <HamburgerMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* محتوای اصلی */}
      <main className="main-content">
        {activeTab === 'chat' && (
          <div className="chat-section fullscreen">
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

      {/* فوتر فقط برای دسکتاپ */}
      <footer className="app-footer desktop-only">
        <div className="footer-content">
          <span>VortexAI Monitor v4.0.0</span>
          <span className="separator">•</span>
          <span>Status: {systemStatus?.status === 'healthy' ? 'عملیاتی' : 'اختلال'}</span>
          <span className="separator">•</span>
          <span>آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}</span>
        </div>
      </footer>
    </div>
  )
}

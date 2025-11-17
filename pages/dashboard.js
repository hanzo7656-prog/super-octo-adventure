import { useState, useEffect } from 'react'
import Head from 'next/head'
import StatusCards from '../components/StatusCards'
import ResourceMonitor from '../components/ResourceMonitor'
import AlertsPanel from '../components/AlertsPanel'
import CacheStatus from '../components/CacheStatus'
import { healthAPI } from '../lib/api'

export default function Dashboard() {
  const [systemData, setSystemData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      const [status, metrics, alerts, cache] = await Promise.all([
        healthAPI.getFullStatus(),
        healthAPI.getMetrics('all'),
        healthAPI.getAlerts(),
        healthAPI.getCacheStatus('status')
      ])
      
      setSystemData({
        status,
        metrics,
        alerts,
        cache
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🌀</div>
        <p>در حال بارگذاری داشبورد...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Head>
        <title>داشبورد پیشرفته - VortexAI</title>
      </Head>

      <header className="dashboard-header">
        <h1>📊 داشبورد پیشرفته مانیتورینگ</h1>
        <button onClick={loadDashboardData} className="refresh-btn">
          🔄 بروزرسانی
        </button>
      </header>

      <div className="dashboard-grid">
        <div className="grid-column">
          <StatusCards data={systemData?.status} />
          <ResourceMonitor data={systemData?.status} />
        </div>
        
        <div className="grid-column">
          <AlertsPanel data={systemData?.alerts} />
          <CacheStatus data={systemData?.cache} />
        </div>
      </div>
    </div>
  )
}

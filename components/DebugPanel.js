import { useState, useEffect } from 'react'
import { healthAPI } from '../lib/api'

export default function DebugPanel({ view }) {
  const [debugData, setDebugData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  useEffect(() => {
    loadDebugData()
  }, [view])

  const loadDebugData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let data
      switch (view) {
        case 'overview':
          data = await healthAPI.getStatus('full')
          break
        case 'performance':
          data = await healthAPI.getMetrics('all')
          break
        case 'alerts':
          data = await healthAPI.getAlerts()
          break
        case 'cache':
          data = await healthAPI.getCacheStatus('analysis')
          break
        case 'workers':
          data = await healthAPI.getWorkersStatus()
          break
        default:
          data = await healthAPI.getStatus('basic')
      }
      setDebugData(data)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error loading debug data:', error)
      setError(`خطا در بارگذاری داده: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getViewTitle = () => {
    const titles = {
      overview: 'نمای کلی سیستم',
      performance: 'متریک‌های عملکرد',
      alerts: 'هشدارها و خطاها',
      cache: 'تحلیل سیستم کش',
      workers: 'وضعیت کارگران'
    }
    return titles[view] || 'دیباگ'
  }

  const renderOverview = () => {
    if (!debugData?.data) return null
    
    return (
      <div className="overview-grid">
        <div className="status-card">
          <h4>وضعیت کلی</h4>
          <div className={`status-badge ${debugData.data.overview?.status || 'unknown'}`}>
            {debugData.data.overview?.status || 'نامشخص'}
          </div>
        </div>
        
        <div className="status-card">
          <h4>سرویس‌ها</h4>
          <div className="services-list">
            {Object.entries(debugData.data.services || {}).map(([key, value]) => (
              <div key={key} className="service-item">
                <span className="service-name">{key}</span>
                <span className={`service-status ${value}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderAlerts = () => {
    if (!debugData?.data) return null
    
    const alerts = Array.isArray(debugData.data) ? debugData.data : debugData.data.alerts || []
    
    return (
      <div className="alerts-container">
        {alerts.length === 0 ? (
          <div className="no-alerts">⚠️ هیچ هشداری وجود ندارد</div>
        ) : (
          alerts.map((alert, index) => (
            <div key={index} className={`alert-item ${alert.level || 'info'}`}>
              <div className="alert-header">
                <span className="alert-level">{alert.level || 'INFO'}</span>
                <span className="alert-time">
                  {alert.timestamp ? new Date(alert.timestamp).toLocaleString('fa-IR') : 'نامشخص'}
                </span>
              </div>
              <div className="alert-message">{alert.message}</div>
              {alert.details && (
                <div className="alert-details">
                  <pre>{JSON.stringify(alert.details, null, 2)}</pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    )
  }

  const renderCache = () => {
    if (!debugData?.data) return null
    
    return (
      <div className="cache-analysis">
        <div className="cache-stats">
          <div className="stat">
            <span className="stat-label">Hit Rate:</span>
            <span className="stat-value">{debugData.data.hit_rate || 0}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">کلیدهای فعال:</span>
            <span className="stat-value">{debugData.data.keys || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">حجم کش:</span>
            <span className="stat-value">{debugData.data.size || 0}</span>
          </div>
        </div>
        
        {debugData.data.analysis && (
          <div className="cache-analysis-details">
            <h4>تحلیل عملکرد:</h4>
            <pre>{JSON.stringify(debugData.data.analysis, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  const renderPerformance = () => {
    if (!debugData?.data) return null
    
    return (
      <div className="performance-metrics">
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">میانگین پاسخ</span>
            <span className="metric-value">
              {debugData.data.performance?.response_time_avg || 0}ms
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">درخواست‌ها</span>
            <span className="metric-value">
              {debugData.data.requests?.total || 0}
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">خطاها</span>
            <span className="metric-value error">
              {debugData.data.requests?.errors || 0}
            </span>
          </div>
        </div>
        
        <div className="raw-data">
          <details>
            <summary>داده خام</summary>
            <pre>{JSON.stringify(debugData.data, null, 2)}</pre>
          </details>
        </div>
      </div>
    )
  }

  const renderWorkers = () => {
    if (!debugData?.data) return null
    
    const workers = Array.isArray(debugData.data) ? debugData.data : debugData.data.workers || []
    
    return (
      <div className="workers-status">
        {workers.length === 0 ? (
          <div className="no-workers">🔄 هیچ کارگری فعال نیست</div>
        ) : (
          workers.map((worker, index) => (
            <div key={index} className={`worker-item ${worker.status}`}>
              <div className="worker-info">
                <span className="worker-name">{worker.name || `Worker ${index + 1}`}</span>
                <span className={`worker-status ${worker.status}`}>
                  {worker.status || 'unknown'}
                </span>
              </div>
              {worker.jobs && (
                <div className="worker-jobs">
                  <span>Jobs: {worker.jobs}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    )
  }

  const renderContent = () => {
    if (error) {
      return (
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h4>خطا در بارگذاری داده</h4>
          <p>{error}</p>
          <button onClick={loadDebugData} className="retry-btn">
            تلاش مجدد
          </button>
        </div>
      )
    }

    if (!debugData) {
      return <div className="no-data">داده‌ای برای نمایش وجود ندارد</div>
    }

    switch (view) {
      case 'overview':
        return renderOverview()
      case 'alerts':
        return renderAlerts()
      case 'cache':
        return renderCache()
      case 'performance':
        return renderPerformance()
      case 'workers':
        return renderWorkers()
      default:
        return (
          <div className="raw-data">
            <pre>{JSON.stringify(debugData, null, 2)}</pre>
          </div>
        )
    }
  }

  return (
    <div className="debug-panel">
      <div className="panel-header">
        <div className="panel-title">
          <h3>{getViewTitle()}</h3>
          {lastRefresh && (
            <span className="last-refresh">
              آخرین بروزرسانی: {lastRefresh.toLocaleTimeString('fa-IR')}
            </span>
          )}
        </div>
        <div className="panel-actions">
          <button 
            onClick={loadDebugData} 
            className="refresh-btn"
            disabled={isLoading}
          >
            {isLoading ? 'در حال بارگذاری...' : 'بروزرسانی'}
          </button>
        </div>
      </div>

      <div className="panel-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>در حال بارگذاری داده‌های دیباگ...</p>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  )
}

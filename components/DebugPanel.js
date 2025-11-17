import { useState, useEffect } from 'react'
import { healthAPI } from '../lib/api'

export default function DebugPanel({ view }) {
  const [debugData, setDebugData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadDebugData()
  }, [view])

  const loadDebugData = async () => {
    setIsLoading(true)
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
    } catch (error) {
      console.error('Error loading debug data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="loading">در حال بارگذاری داده‌های دیباگ...</div>
  }

  return (
    <div className="debug-panel">
      <div className="panel-header">
        <h3>نمایش: {view}</h3>
        <button onClick={loadDebugData} className="refresh-btn">
          🔄 بروزرسانی
        </button>
      </div>

      <div className="debug-content">
        <pre className="debug-output">
          {JSON.stringify(debugData, null, 2)}
        </pre>
      </div>
    </div>
  )
}

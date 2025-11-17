export default function AlertsPanel({ data }) {
  if (!data) return null

  const alerts = data.active_alerts || []

  const getAlertIcon = (level) => {
    switch (level) {
      case 'CRITICAL': return '🔴'
      case 'WARNING': return '🟡'
      case 'INFO': return '🔵'
      default: return '⚪'
    }
  }

  return (
    <div className="alerts-panel">
      <div className="panel-header">
        <h3>🚨 هشدارهای سیستم</h3>
        <span className="alert-count">{alerts.length}</span>
      </div>
      
      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">✅ هیچ هشدار فعالی وجود ندارد</div>
        ) : (
          alerts.slice(0, 10).map(alert => (
            <div key={alert.id} className={`alert-item ${alert.level?.toLowerCase()}`}>
              <div className="alert-icon">
                {getAlertIcon(alert.level)}
              </div>
              <div className="alert-content">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-time">
                  {new Date(alert.timestamp).toLocaleString('fa-IR')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function StatusCards({ data }) {
  if (!data) return null

  const cards = [
    {
      title: 'سلامت سیستم',
      value: data.health_score || 0,
      suffix: '%',
      status: data.health_score > 80 ? 'healthy' : data.health_score > 60 ? 'warning' : 'critical',
      icon: '🔄'
    },
    {
      title: 'اتصال کش',
      value: data.detailed_analysis?.cache_health?.cloud_resources?.databases_connected || 0,
      suffix: '/5',
      status: data.services?.cache ? 'healthy' : 'critical',
      icon: '💾'
    },
    {
      title: 'کارگران فعال',
      value: data.detailed_analysis?.background_worker?.workers_active || 0,
      suffix: '/4',
      status: data.detailed_analysis?.background_worker?.is_running ? 'healthy' : 'warning',
      icon: '⚙️'
    },
    {
      title: 'API خارجی',
      value: data.services?.external_apis ? 'متصل' : 'قطع',
      status: data.services?.external_apis ? 'healthy' : 'critical',
      icon: '🌐'
    }
  ]

  return (
    <div className="status-cards">
      {cards.map((card, index) => (
        <div key={index} className={`status-card ${card.status}`}>
          <div className="card-icon">{card.icon}</div>
          <div className="card-content">
            <div className="card-title">{card.title}</div>
            <div className="card-value">
              {card.value}
              {card.suffix && <span className="card-suffix">{card.suffix}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

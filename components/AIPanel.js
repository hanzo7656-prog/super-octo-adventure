export default function AIPanel() {
  return (
    <div className="ai-panel">
      <div className="panel-header">
        <h3>🤖 سیستم هوش مصنوعی</h3>
        <span className="status-badge development">در حال توسعه</span>
      </div>
      
      <div className="ai-content">
        <div className="ai-message">
          🚧 سیستم هوش مصنوعی پیشرفته VortexAI به زودی فعال خواهد شد
        </div>
        
        <div className="ai-features">
          <div className="feature-item">
            <span className="feature-icon">🔮</span>
            <span>پیش‌بینی بازار</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>تحلیل هوشمند</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>پیشنهادات بهینه</span>
          </div>
        </div>
        
        <div className="ai-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{width: '65%'}}></div>
          </div>
          <div className="progress-text">پیشرفت: ۶۵٪</div>
        </div>
      </div>
    </div>
  )
}

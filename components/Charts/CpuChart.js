export default function CpuChart({ data }) {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <h4>📈 نمودار مصرف CPU</h4>
      </div>
      <div className="chart-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">📊</div>
          <p>نمودارهای پیشرفته به زودی اضافه خواهند شد</p>
          <small>مصرف فعلی: {data?.usage_percent || 0}%</small>
        </div>
      </div>
    </div>
  )
}

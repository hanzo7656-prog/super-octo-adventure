import React from 'react'
import StatusIndicator from './StatusIndicator'

const Header = ({ sidebarOpen, setSidebarOpen, backendStatus }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <div className="logo">
          <span className="logo-icon">🌀</span>
          <span className="logo-text">VortexAI</span>
        </div>
      </div>

      <div className="header-right">
        <StatusIndicator status={backendStatus} />
      </div>
    </header>
  )
}

export default Header

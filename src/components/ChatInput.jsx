import React, { useState } from 'react'

const ChatInput = ({ onSendMessage, loading, disabled }) => {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !loading && !disabled) {
      onSendMessage(message)
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-wrapper">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "در حال اتصال به سرور..." : "پیام خود را بنویسید..."}
            disabled={disabled || loading}
            rows="1"
            className="chat-textarea"
          />
          
          <button 
            type="submit" 
            disabled={!message.trim() || loading || disabled}
            className="send-button"
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </form>
      
      <div className="input-footer">
        <span className="hint-text">
          VortexAI می‌تواند در مورد قیمت‌ها، اخبار، و تحلیل بازار کریپتو کمک کند
        </span>
      </div>
    </div>
  )
}

export default ChatInput

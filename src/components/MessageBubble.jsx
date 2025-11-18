import React from 'react'

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user'
  const isError = message.isError

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'ai'} ${isError ? 'error' : ''}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🌀'}
      </div>
      
      <div className="message-content">
        <div className="message-text">
          {message.content}
        </div>
        
        {message.metadata && (
          <div className="message-metadata">
            {message.metadata.intent && (
              <span className="metadata-tag">#{message.metadata.intent}</span>
            )}
            {message.metadata.confidence && (
              <span className="metadata-tag">
                اطمینان: {Math.round(message.metadata.confidence * 100)}%
              </span>
            )}
          </div>
        )}
        
        <div className="message-time">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble

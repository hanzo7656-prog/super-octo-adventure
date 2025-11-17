// components/ChatInterface.js - نسخه بدون دستورات سریع
import { useState, useRef, useEffect } from 'react'

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: '🤖 سلام! من دستیار هوشمند VortexAI هستم. می‌تونم وضعیت سیستم، قیمت ارزها، اخبار و اطلاعات فنی رو بهتون گزارش بدم.',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUserId = localStorage.getItem('vortexai_user_id')
      if (savedUserId) return savedUserId
      
      const newUserId = 'user_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('vortexai_user_id', newUserId)
      return newUserId
    }
    return 'user_default'
  })
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadChatHistory()
  }, [])

  const loadChatHistory = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://ai-test-3gix.onrender.com'}/api/chatbot/history/${userId}`
      )
      const data = await response.json()
      
      if (data.history && data.history.length > 0) {
        const historyMessages = data.history.flatMap(conv => [
          {
            id: conv.id + '_q',
            type: 'user',
            content: conv.question,
            timestamp: new Date(conv.timestamp)
          },
          {
            id: conv.id + '_a', 
            type: 'system',
            content: conv.answer,
            timestamp: new Date(conv.timestamp)
          }
        ])
        setMessages(prev => [...historyMessages, ...prev])
      }
    } catch (error) {
      console.log('بارگذاری تاریخچه انجام نشد')
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://ai-test-3gix.onrender.com'}/api/chatbot/ask`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: inputMessage,
            user_id: userId
          })
        }
      )

      const botResponse = await response.json()

      const botMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: botResponse.answer || "❌ پاسخی دریافت نشد",
        timestamp: new Date(),
        success: botResponse.success,
        command: botResponse.command,
        confidence: botResponse.confidence
      }

      setMessages(prev => [...prev, botMessage])

    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: '❌ خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChatHistory = () => {
    setMessages([
      {
        id: Date.now(),
        type: 'system', 
        content: '🧹 تاریخچه گفتگو پاک شد. چطور می‌تونم کمک کنم؟',
        timestamp: new Date()
      }
    ])
  }

  const formatMessageContent = (content) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div className="chat-interface">
      {/* هدر چت */}
      <div className="chat-header">
        <div className="chat-title">
          <div className="bot-avatar">🤖</div>
          <div>
            <h3>دستیار VortexAI</h3>
            <span className="status-dot"></span>
            <span className="status-text">آنلاین</span>
          </div>
        </div>
        <button 
          onClick={clearChatHistory}
          className="clear-button"
          title="پاک کردن تاریخچه"
        >
          🗑️
        </button>
      </div>

      {/* پیام‌ها - فضای بیشتر */}
      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type} ${message.isError ? 'error' : ''}`}>
            <div className="message-avatar">
              {message.type === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">
                {formatMessageContent(message.content)}
              </div>
              <div className="message-meta">
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString('fa-IR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {message.command && (
                  <span className="message-command">
                    • {message.command}
                  </span>
                )}
                {message.confidence && (
                  <span className="message-confidence">
                    • اطمینان: {Math.round(message.confidence * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message system">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span>در حال پردازش</span>
                <div className="typing-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* ورودی متن - بدون دستورات سریع */}
      <div className="chat-input-container">
        <div className="input-wrapper">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="سوال خود را بپرسید... (مثال: وضعیت سیستم، قیمت بیتکوین، مصرف منابع)"
            rows="1"
            className="chat-input"
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              '📤'
            )}
          </button>
        </div>
        
        <div className="input-hint">
          ⏎ Enter برای ارسال • ⇧ Shift + Enter برای خط جدید
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { commandParser } from '../lib/commandParser'
import { healthAPI } from '../lib/api'

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: 'سلام! به VortexAI Monitor خوش آمدید. می‌تونم وضعیت سیستم رو براتون چک کنم.',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      // پردازش دستور کاربر
      const command = commandParser.parse(inputMessage)
      let response

      switch (command.type) {
        case 'health':
          response = await healthAPI.getStatus(command.detail || 'basic')
          break
        case 'cache':
          response = await healthAPI.getCacheStatus(command.view || 'status')
          break
        case 'alerts':
          response = await healthAPI.getAlerts()
          break
        case 'resources':
          response = await healthAPI.getMetrics('system')
          break
        default:
          response = { message: 'دستور را متوجه نشدم. لطفاً دوباره تلاش کنید.' }
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: formatResponse(command.type, response),
        timestamp: new Date(),
        data: response
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: '❌ خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatResponse = (type, data) => {
    switch (type) {
      case 'health':
        return `🔄 وضعیت سیستم: ${data.status === 'healthy' ? '🟢 سالم' : '🔴 مشکل'}
• امتیاز سلامت: ${data.health_score || 0}/100
• زمان پاسخ: ${data.response_time_ms || 0}ms
• کش: ${data.services?.cache ? '🟢 فعال' : '🔴 غیرفعال'}
• کارگران: ${data.detailed_analysis?.background_worker?.workers_active || 0} فعال`

      case 'cache':
        return `💾 وضعیت کش: ${data.health?.status === 'healthy' ? '🟢 سالم' : '🔴 مشکل'}
• اتصال: ${data.health?.cloud_resources?.databases_connected || 0}/5 دیتابیس
• امتیاز: ${data.health?.health_score || 0}%
• حافظه: ${data.health?.cloud_resources?.storage_used_mb || 0}MB از ${data.health?.cloud_resources?.storage_total_mb || 0}MB`

      case 'alerts':
        const alerts = data.active_alerts || []
        return `🚨 هشدارهای فعال: ${alerts.length}
${alerts.slice(0, 3).map(alert => `• ${alert.level === 'CRITICAL' ? '🔴' : '🟡'} ${alert.title}`).join('\n')}`

      case 'resources':
        const resources = data.system || {}
        return `⚡ مصرف منابع:
• CPU: ${resources.cpu?.usage_percent || 0}%
• حافظه: ${resources.memory?.usage_percent || 0}%
• دیسک: ${resources.disk?.usage_percent || 0}%`

      default:
        return JSON.stringify(data, null, 2)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString('fa-IR')}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message system">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="quick-commands">
          {['وضعیت کلی', 'هشدارها', 'وضعیت کش', 'مصرف منابع', 'کارگران'].map(cmd => (
            <button
              key={cmd}
              className="quick-command"
              onClick={() => setInputMessage(cmd)}
            >
              {cmd}
            </button>
          ))}
        </div>
        
        <div className="input-wrapper">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="پیام خود را بنویسید... (مثال: وضعیت کلی، هشدارها، وضعیت کش)"
            rows="1"
            className="chat-input"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  )
}

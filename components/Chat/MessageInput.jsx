import { useState, useRef, useEffect } from 'react';

export default function MessageInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // تنظیم ارتفاع خودکار textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="پیام خود را بنویسید... (Enter برای ارسال، Shift+Enter برای خط جدید)"
            disabled={disabled}
            rows={1}
            className="message-textarea"
          />
          
          <button 
            type="submit" 
            disabled={!message.trim() || disabled}
            className="send-button"
          >
            {disabled ? (
              <div className="loading-spinner"></div>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M2 21L23 12L2 3V10L17 12L2 14V21Z" 
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .message-input-container {
          padding: 20px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .message-form {
          max-width: 800px;
          margin: 0 auto;
        }

        .input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          padding: 12px 16px;
          transition: all 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .message-textarea {
          flex: 1;
          border: none;
          background: none;
          resize: none;
          outline: none;
          font-size: 16px;
          line-height: 1.5;
          max-height: 120px;
          font-family: inherit;
        }

        .message-textarea::placeholder {
          color: #a0aec0;
        }

        .send-button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .send-button:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .message-input-container {
            padding: 15px;
          }
          
          .input-wrapper {
            padding: 10px 14px;
          }
        }
      `}</style>
    </div>
  );
}

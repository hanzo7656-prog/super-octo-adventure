import { useState, useRef, useEffect } from 'react';
import Message from 'components/chat/Message';
import MessageInput from 'components/chat/MessageInput';
import TypingIndicator from 'components/UI/TypingIndicator';
import Suggestions from 'components/UI/Suggestions';
import { useChat } from 'hooks/useChat';

export default function ChatContainer({ session, user, onSessionUpdate }) {
  const {
    messages,
    isTyping,
    sendMessage,
    sessionId,
    clearMessages
  } = useChat(user.id, session?.id);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (sessionId && !session) {
      onSessionUpdate({ id: sessionId });
    }
  }, [sessionId, session, onSessionUpdate]);

  const handleSendMessage = async (message) => {
    const response = await sendMessage(message);
    return response;
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-section">
            <div className="welcome-content">
              <div className="ai-avatar">
                <div className="ai-icon">🧠</div>
              </div>
              <h1>به VortexAI خوش آمدید</h1>
              <p>دستیار هوشمند تحلیل بازار کریپتوکارنسی</p>
              
              <Suggestions onSuggestionClick={handleSuggestionClick} />
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <Message 
                key={message.id || index} 
                message={message} 
              />
            ))}
            
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: white;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          scroll-behavior: smooth;
        }

        .welcome-section {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }

        .welcome-content {
          max-width: 500px;
          padding: 40px;
        }

        .ai-avatar {
          margin-bottom: 20px;
        }

        .ai-icon {
          font-size: 64px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        h1 {
          color: #2d3748;
          margin-bottom: 10px;
          font-size: 28px;
          font-weight: 700;
        }

        p {
          color: #718096;
          font-size: 16px;
          margin-bottom: 30px;
        }

        @media (max-width: 768px) {
          .messages-container {
            padding: 10px;
          }
          
          .welcome-content {
            padding: 20px;
          }
          
          h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}

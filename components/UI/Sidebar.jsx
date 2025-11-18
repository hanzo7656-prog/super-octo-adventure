import { useState, useEffect } from 'react';

export default function Sidebar({ isOpen, currentSession, user, onNewSession, onToggle }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // بارگذاری سشن‌های کاربر
    const loadSessions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions?user_id=${user.id}&limit=10`);
        const data = await response.json();
        if (data.sessions) {
          setSessions(data.sessions);
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    };

    loadSessions();
  }, [user.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewSession}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2"/>
          </svg>
          چت جدید
        </button>
        <button className="close-sidebar" onClick={onToggle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      </div>

      <div className="sessions-list">
        <h3>مکالمات اخیر</h3>
        {sessions.length === 0 ? (
          <div className="no-sessions">
            <p>هنوز مکالمه‌ای ندارید</p>
          </div>
        ) : (
          sessions.map(session => (
            <div 
              key={session.session_id}
              className={`session-item ${currentSession?.id === session.session_id ? 'active' : ''}`}
              onClick={() => onNewSession(session)}
            >
              <div className="session-preview">
                {session.messages?.[0]?.content || 'مکالمه جدید'}
              </div>
              <div className="session-meta">
                <span>{session.message_count} پیام</span>
                <span>{formatDate(session.last_activity)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user.name.charAt(0)}
          </div>
          <div className="user-details">
            <span className="user-name">{user.name}</span>
            <span className="user-status">آنلاین</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 300px;
          background: #2d3748;
          color: white;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
          border-left: 1px solid #4a5568;
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #4a5568;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .new-chat-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .new-chat-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .close-sidebar {
          background: none;
          border: none;
          color: #a0aec0;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .close-sidebar:hover {
          background: #4a5568;
        }

        .sessions-list {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .sessions-list h3 {
          margin-bottom: 16px;
          color: #e2e8f0;
          font-size: 16px;
          font-weight: 600;
        }

        .session-item {
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          border: 1px solid transparent;
        }

        .session-item:hover {
          background: #4a5568;
        }

        .session-item.active {
          background: #667eea;
          border-color: #764ba2;
        }

        .session-preview {
          font-size: 14px;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          color: #e2e8f0;
        }

        .session-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #a0aec0;
        }

        .no-sessions {
          text-align: center;
          padding: 40px 20px;
          color: #a0aec0;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid #4a5568;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
        }

        .user-status {
          font-size: 12px;
          color: #48bb78;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            z-index: 1000;
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

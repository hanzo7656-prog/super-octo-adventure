import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from 'components/Layout/Header';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessions, setSelectedSessions] = useState(new Set());
  const router = useRouter();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const userId = `user_${Date.now()}`; // در حالت واقعی از context/auth استفاده می‌شود
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions?user_id=${userId}&limit=50`
      );
      const data = await response.json();
      
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      setSessions(prev => prev.filter(session => session.session_id !== sessionId));
      setSelectedSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('خطا در حذف مکالمه');
    }
  };

  const deleteSelectedSessions = async () => {
    if (selectedSessions.size === 0) return;

    if (!confirm(`آیا از حذف ${selectedSessions.size} مکالمه انتخاب شده مطمئن هستید؟`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedSessions).map(sessionId =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions/${sessionId}`, {
          method: 'DELETE'
        })
      );

      await Promise.all(deletePromises);
      
      setSessions(prev => prev.filter(session => !selectedSessions.has(session.session_id)));
      setSelectedSessions(new Set());
      
      alert('مکالمات انتخاب شده با موفقیت حذف شدند');
    } catch (error) {
      console.error('Error deleting sessions:', error);
      alert('خطا در حذف مکالمات');
    }
  };

  const toggleSessionSelection = (sessionId) => {
    setSelectedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const selectAllSessions = () => {
    if (selectedSessions.size === sessions.length) {
      setSelectedSessions(new Set());
    } else {
      setSelectedSessions(new Set(sessions.map(session => session.session_id)));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPreviewText = (messages) => {
    if (!messages || messages.length === 0) return 'بدون پیام';
    
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content.length > 60 
      ? lastMessage.content.substring(0, 60) + '...'
      : lastMessage.content;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>در حال بارگذاری مکالمات...</p>
      </div>
    );
  }

  return (
    <div className="sessions-page">
      <Head>
        <title>مدیریت مکالمات - VortexAI</title>
      </Head>

      <Header user={{ id: 'user', name: 'کاربر' }} />

      <div className="sessions-content">
        <div className="sessions-header">
          <h1>مدیریت مکالمات</h1>
          <div className="header-actions">
            {selectedSessions.size > 0 && (
              <button 
                className="delete-selected-btn"
                onClick={deleteSelectedSessions}
              >
                حذف انتخاب شده‌ها ({selectedSessions.size})
              </button>
            )}
            <button 
              className="new-chat-btn"
              onClick={() => router.push('/')}
            >
              چت جدید
            </button>
          </div>
        </div>

        <div className="sessions-list">
          {sessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h2>هنوز مکالمه‌ای ندارید</h2>
              <p>شروع کنید با VortexAI چت کنید!</p>
              <button 
                className="start-chat-btn"
                onClick={() => router.push('/')}
              >
                شروع چت جدید
              </button>
            </div>
          ) : (
            <>
              <div className="list-header">
                <label className="select-all-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSessions.size === sessions.length && sessions.length > 0}
                    onChange={selectAllSessions}
                  />
                  انتخاب همه
                </label>
                <span className="total-sessions">
                  {sessions.length} مکالمه
                </span>
              </div>

              {sessions.map(session => (
                <div key={session.session_id} className="session-card">
                  <div className="session-select">
                    <input
                      type="checkbox"
                      checked={selectedSessions.has(session.session_id)}
                      onChange={() => toggleSessionSelection(session.session_id)}
                    />
                  </div>
                  
                  <div 
                    className="session-content"
                    onClick={() => router.push(`/?session=${session.session_id}`)}
                  >
                    <div className="session-preview">
                      {getPreviewText(session.messages)}
                    </div>
                    
                    <div className="session-meta">
                      <span className="message-count">
                        {session.message_count} پیام
                      </span>
                      <span className="session-date">
                        {formatDate(session.last_activity)}
                      </span>
                    </div>
                  </div>

                  <div className="session-actions">
                    <button 
                      className="action-btn resume-btn"
                      onClick={() => router.push(`/?session=${session.session_id}`)}
                    >
                      ادامه مکالمه
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => deleteSession(session.session_id)}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .sessions-page {
          height: 100vh;
          background: #f8f9fa;
        }

        .sessions-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px;
          height: calc(100vh - 80px);
          overflow-y: auto;
        }

        .sessions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .sessions-header h1 {
          color: #2d3748;
          font-size: 28px;
          font-weight: 700;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .delete-selected-btn {
          background: #f56565;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .delete-selected-btn:hover {
          background: #e53e3e;
        }

        .new-chat-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .new-chat-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding: 0 12px;
        }

        .select-all-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #4a5568;
          font-size: 14px;
        }

        .total-sessions {
          color: #718096;
          font-size: 14px;
        }

        .session-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .session-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-color: #667eea;
        }

        .session-select {
          flex-shrink: 0;
        }

        .session-content {
          flex: 1;
          min-width: 0;
        }

        .session-preview {
          font-size: 16px;
          color: #2d3748;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .session-meta {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: #718096;
        }

        .session-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .action-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .resume-btn {
          background: #edf2f7;
          color: #4a5568;
        }

        .resume-btn:hover {
          background: #e2e8f0;
        }

        .delete-btn {
          background: #fed7d7;
          color: #c53030;
        }

        .delete-btn:hover {
          background: #feb2b2;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #718096;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-state h2 {
          color: #4a5568;
          margin-bottom: 8px;
          font-size: 24px;
        }

        .empty-state p {
          margin-bottom: 24px;
          font-size: 16px;
        }

        .start-chat-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }

        .start-chat-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .sessions-content {
            padding: 16px;
          }
          
          .sessions-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          
          .session-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .session-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
}

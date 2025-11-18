import { useState, useEffect } from 'react';
import Head from 'next/head';
import ChatContainer from '../components/Chat/ChatContainer';
import Sidebar from '../components/UI/Sidebar';
import Header from '../components/Layout/Header';

export default function Home() {
  const [currentSession, setCurrentSession] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState({
    id: `user_${Date.now()}`,
    name: 'کاربر VortexAI'
  });

  return (
    <div className="app-container">
      <Head>
        <title>VortexAI - دستیار هوشمند کریپتو</title>
        <meta name="description" content="دستیار هوشمند تحلیل بازار کریپتوکارنسی" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="main-layout">
        <Sidebar 
          isOpen={isSidebarOpen}
          currentSession={currentSession}
          user={user}
          onNewSession={() => setCurrentSession(null)}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div className="chat-area">
          <Header 
            user={user}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          
          <ChatContainer
            session={currentSession}
            user={user}
            onSessionUpdate={setCurrentSession}
          />
        </div>
      </div>

      <style jsx>{`
        .app-container {
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .main-layout {
          display: flex;
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 20px;
          margin: 10px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
        }

        @media (max-width: 768px) {
          .main-layout {
            margin: 0;
            border-radius: 0;
          }
          
          .sidebar {
            position: absolute;
            z-index: 1000;
          }
        }
      `}</style>
    </div>
  );
}

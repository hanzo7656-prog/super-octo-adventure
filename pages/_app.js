import { useEffect } from 'react';
import './styles/globals.css';
import './styles/themes.css';
import { AppStateProvider } from './hooks/useAppState';
import NotificationsContainer from './components/UI/NotificationsContainer';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // بررسی پشتیبانی از سرویس ورکر
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <AppStateProvider>
      <div className="app">
        <Component {...pageProps} />
        <NotificationsContainer />
      </div>
    </AppStateProvider>
  );
}

export default MyApp;

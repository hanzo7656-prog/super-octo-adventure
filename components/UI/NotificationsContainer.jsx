import { useEffect } from 'react';
import { useNotifications } from 'hooks/useNotifications';
import Notification from 'components/UI/Notification';

export default function NotificationsContainer() {
  const { notifications, removeNotification } = useNotifications();

  // مدیریت کلید Escape برای بستن نوتیفیکیشن‌ها
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && notifications.length > 0) {
        // بستن آخرین نوتیفیکیشن
        removeNotification(notifications[notifications.length - 1].id);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [notifications, removeNotification]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      <style jsx>{`
        .notifications-container {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 10000;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .notifications-container {
            top: 10px;
            left: 10px;
            right: 10px;
          }
        }
      `}</style>
    </div>
  );
}

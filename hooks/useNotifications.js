import { useCallback } from 'react';
import { useAppState } from './useAppState';

export function useNotifications() {
  const { state, actions } = useAppState();

  const showNotification = useCallback(({
    type = 'info',
    title,
    message,
    duration = 5000,
    action
  }) => {
    const id = Date.now().toString();
    
    const notification = {
      id,
      type,
      title,
      message,
      duration,
      action,
      timestamp: new Date().toISOString()
    };

    actions.addNotification(notification);

    // حذف خودکار نوتیفیکیشن
    if (duration > 0) {
      setTimeout(() => {
        actions.removeNotification(id);
      }, duration);
    }

    return id;
  }, [actions]);

  const removeNotification = useCallback((id) => {
    actions.removeNotification(id);
  }, [actions]);

  const showSuccess = useCallback((message, title = 'موفقیت') => {
    return showNotification({ type: 'success', title, message });
  }, [showNotification]);

  const showError = useCallback((message, title = 'خطا') => {
    return showNotification({ type: 'error', title, message });
  }, [showNotification]);

  const showWarning = useCallback((message, title = 'هشدار') => {
    return showNotification({ type: 'warning', title, message });
  }, [showNotification]);

  const showInfo = useCallback((message, title = 'اطلاعیه') => {
    return showNotification({ type: 'info', title, message });
  }, [showNotification]);

  return {
    notifications: state.notifications,
    showNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}

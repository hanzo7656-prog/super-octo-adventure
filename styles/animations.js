/* انیمیشن‌های سفارشی */

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

/* انیمیشن‌های کاربردی */
.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.pulse {
  animation: pulse 2s infinite;
}

.bounce {
  animation: bounce 1s ease infinite;
}

/* انیمیشن برای کارت‌ها */
.status-card {
  animation: fadeInUp 0.6s ease-out;
}

.status-card:nth-child(1) { animation-delay: 0.1s; }
.status-card:nth-child(2) { animation-delay: 0.2s; }
.status-card:nth-child(3) { animation-delay: 0.3s; }
.status-card:nth-child(4) { animation-delay: 0.4s; }

/* انیمیشن برای پیام‌ها */
.message {
  animation: fadeInUp 0.4s ease-out;
}

/* انیمیشن برای دکمه‌ها */
.send-button, .refresh-btn, .nav-tab {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* انیمیشن برای نمودارها */
.progress-fill {
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* انیمیشن برای اسپینر */
.loading-spinner {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* انیمیشن برای هشدارها */
.alert-item {
  animation: slideInRight 0.5s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* انیمیشن برای تب‌ها */
.tab-button.active {
  animation: pulse 0.6s ease;
}

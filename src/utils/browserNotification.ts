// Browser Notification Utilities

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

export const showBrowserNotification = (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      ...options,
    });
  }
};

export const notifyNewAssignment = (title: string) => {
  showBrowserNotification('📝 Tugas Baru', {
    body: title,
    tag: 'assignment',
  });
};

export const notifyNewPayment = (month: string, amount: string) => {
  showBrowserNotification('💰 Pembayaran SPP', {
    body: `${month} - ${amount}`,
    tag: 'payment',
  });
};

export const notifyGraded = (title: string, score: string) => {
  showBrowserNotification('📊 Nilai Baru', {
    body: `${title} - Nilai: ${score}`,
    tag: 'grade',
  });
};

export const notifyAnnouncement = (title: string, message: string) => {
  showBrowserNotification('📢 Pengumuman', {
    body: `${title}: ${message}`,
    tag: 'announcement',
  });
};

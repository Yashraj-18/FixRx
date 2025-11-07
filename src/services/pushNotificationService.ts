// Disabled for production demo
export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  invitations?: boolean;
  messages?: boolean;
  ratings?: boolean;
  vendorUpdates?: boolean;
  systemAlerts?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    startTime?: string;
    endTime?: string;
  };
}

export class PushNotificationService {
  static getInstance() {
    return {
      initialize: () => Promise.resolve(),
      requestPermissions: () => Promise.resolve(false),
      sendNotification: () => Promise.resolve(),
      areNotificationsEnabled: () => Promise.resolve(false),
      getPreferences: () => Promise.resolve<NotificationPreferences>({
        enabled: false,
        sound: true,
        vibration: true,
        badge: true,
      }),
      updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise.resolve(),
      sendLocalNotification: (title: string, body: string) => Promise.resolve(),
    };
  }
}
export const pushNotificationService = PushNotificationService.getInstance();

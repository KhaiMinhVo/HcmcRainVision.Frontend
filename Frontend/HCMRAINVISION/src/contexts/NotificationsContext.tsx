/**
 * NotificationsContext – mock notifications list + subscription settings
 * Notifications are mock/realtime; settings stored in localStorage
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { NotificationItem, NotificationSettings } from '../types';
import { STORAGE_KEYS } from '../constants';

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  suggestedWards: string[];
  setSuggestedWards: (wards: string[]) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const DEFAULT_SETTINGS: NotificationSettings = {
  wardIds: [],
  alertOnRain: true,
  alertOnHeavyRain: true,
};

function loadNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) {
      const arr = JSON.parse(raw) as NotificationItem[];
      if (Array.isArray(arr)) return arr;
    }
    // Seed a few mock notifications for demo
    const now = new Date().toISOString();
    return [
      { id: 'seed-1', title: 'Có mưa', message: 'Phát hiện mưa tại Phường 1.', read: false, createdAt: now, type: 'rain', ward: 'Phường 1' },
      { id: 'seed-2', title: 'Cảnh báo mưa nặng', message: 'Mưa nặng tại Phường 5. Lưu ý an toàn giao thông.', read: true, createdAt: now, type: 'heavy_rain', ward: 'Phường 5' },
    ];
  } catch {
    return [];
  }
}

function loadSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const obj = JSON.parse(raw) as NotificationSettings;
    return {
      wardIds: Array.isArray(obj.wardIds) ? obj.wardIds : DEFAULT_SETTINGS.wardIds,
      alertOnRain: typeof obj.alertOnRain === 'boolean' ? obj.alertOnRain : DEFAULT_SETTINGS.alertOnRain,
      alertOnHeavyRain:
        typeof obj.alertOnHeavyRain === 'boolean'
          ? obj.alertOnHeavyRain
          : DEFAULT_SETTINGS.alertOnHeavyRain,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Create a mock notification */
function createMockNotification(
  type: 'rain' | 'heavy_rain',
  ward: string
): NotificationItem {
  const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const isHeavy = type === 'heavy_rain';
  return {
    id,
    title: isHeavy ? 'Cảnh báo mưa nặng' : 'Có mưa',
    message: isHeavy
      ? `Mưa nặng tại ${ward}. Lưu ý an toàn giao thông.`
      : `Phát hiện mưa tại ${ward}.`,
    read: false,
    createdAt: new Date().toISOString(),
    type,
    ward,
  };
}

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(loadNotifications);
  const [settings, setSettingsState] = useState<NotificationSettings>(loadSettings);
  const [suggestedWards, setSuggestedWards] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Realtime mock: add a notification every 15s if we have subscribed wards
  useEffect(() => {
    if (settings.wardIds.length === 0) return;
    intervalRef.current = setInterval(() => {
      const ward = settings.wardIds[Math.floor(Math.random() * settings.wardIds.length)];
      const type = Math.random() > 0.5 ? 'heavy_rain' : 'rain';
      if (type === 'heavy_rain' && !settings.alertOnHeavyRain) return;
      if (type === 'rain' && !settings.alertOnRain) return;
      setNotifications((prev) => {
        const next = [createMockNotification(type, ward), ...prev];
        return next.slice(0, 50);
      });
    }, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings.wardIds, settings.alertOnRain, settings.alertOnHeavyRain]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const updateSettings = useCallback((partial: Partial<NotificationSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...partial }));
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      settings,
      updateSettings,
      suggestedWards,
      setSuggestedWards,
    }),
    [
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      settings,
      updateSettings,
      suggestedWards,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return ctx;
}

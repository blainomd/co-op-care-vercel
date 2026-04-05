/**
 * useRealtimeNotifications — WebSocket-powered notification updates
 *
 * Combines useWebSocket for real-time delivery with useNotifications
 * for push subscription management. Replaces 30s polling with instant updates.
 */
import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useNotifications } from './useNotifications';

export interface RealtimeNotification {
  notificationType: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  receivedAt: string;
}

interface UseRealtimeNotificationsReturn {
  unreadCount: number;
  isConnected: boolean;
  isSubscribed: boolean;
  latestNotification: RealtimeNotification | null;
  notifications: RealtimeNotification[];
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  clearLatest: () => void;
}

const MAX_REALTIME_BUFFER = 50;

export function useRealtimeNotifications(): UseRealtimeNotificationsReturn {
  const { unreadCount, isSubscribed, subscribe, unsubscribe, refreshCount } = useNotifications();
  const [latestNotification, setLatestNotification] = useState<RealtimeNotification | null>(null);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  const handleMessage = useCallback(
    (message: { type: string; data: unknown }) => {
      if (message.type === 'notification') {
        const notification: RealtimeNotification = {
          ...(message.data as Omit<RealtimeNotification, 'receivedAt'>),
          receivedAt: new Date().toISOString(),
        };
        setLatestNotification(notification);
        setNotifications((prev) => [notification, ...prev].slice(0, MAX_REALTIME_BUFFER));

        // Refresh the unread count from server
        refreshCount();
      }
    },
    [refreshCount],
  );

  const { isConnected } = useWebSocket({
    onMessage: handleMessage,
    enabled: true,
  });

  const clearLatest = useCallback(() => {
    setLatestNotification(null);
  }, []);

  return {
    unreadCount,
    isConnected,
    isSubscribed,
    latestNotification,
    notifications,
    subscribe,
    unsubscribe,
    clearLatest,
  };
}

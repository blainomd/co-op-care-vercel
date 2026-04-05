/**
 * useNotifications — Push notification subscription + in-app notification state
 *
 * Manages Web Push API subscription and unread notification count.
 */
import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './useAuth';

interface UseNotificationsReturn {
  unreadCount: number;
  isSubscribed: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  refreshCount: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const refreshCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const result = await api.get<{ unread: number }>('/notifications/count');
      setUnreadCount(result.unread);
    } catch {
      // Silently fail — non-critical
    }
  }, [isAuthenticated]);

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY as string,
      });

      await api.post('/notifications/push/subscribe', subscription.toJSON());
      setIsSubscribed(true);
    } catch {
      // Push not available or denied
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      await api.delete('/notifications/push/subscribe');
      setIsSubscribed(false);
    } catch {
      // Cleanup failure — non-critical
    }
  }, []);

  // Check existing subscription on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    refreshCount();

    // Check push subscription status
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => setIsSubscribed(sub !== null))
        .catch(() => {});
    }
  }, [isAuthenticated, refreshCount]);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(refreshCount, 30_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshCount]);

  return { unreadCount, isSubscribed, subscribe, unsubscribe, refreshCount };
}

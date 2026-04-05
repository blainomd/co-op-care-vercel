/**
 * useInstallPrompt — PWA "Add to Home Screen" prompt
 *
 * Android/Chrome: captures `beforeinstallprompt` event, provides `showPrompt()`.
 * iOS/Safari: no native API — detects iOS and shows manual instructions.
 * Tracks install state so we don't pester users who already installed.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

interface InstallPromptState {
  /** Whether the native install prompt can be triggered (Android/Chrome) */
  canInstall: boolean;
  /** Whether we're on iOS (needs manual instructions) */
  isIOS: boolean;
  /** Whether the app is already running as an installed PWA */
  isInstalled: boolean;
  /** Trigger the native install prompt (Android/Chrome only) */
  showPrompt: () => Promise<boolean>;
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function detectInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  // Check display-mode: standalone (PWA installed and running)
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS adds this to navigator when app is installed
    ('standalone' in window.navigator &&
      (window.navigator as Record<string, unknown>).standalone === true)
  );
}

export function useInstallPrompt(): InstallPromptState {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(detectInstalled);
  const isIOS = detectIOS();

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      // Prevent the browser's default install banner
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPrompt.current = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showPrompt = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt.current) return false;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setCanInstall(false);
    return outcome === 'accepted';
  }, []);

  return { canInstall, isIOS, isInstalled, showPrompt };
}

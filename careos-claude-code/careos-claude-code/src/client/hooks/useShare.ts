/**
 * useShare — Hook wrapping Web Share API, social URL builders, and clipboard.
 *
 * On mobile: triggers native share sheet via navigator.share().
 * On desktop: falls back to ShareModal with 7 channel options.
 */
import { useCallback } from 'react';
import { useShareStore } from '../stores/shareStore';
import { useAuthStore } from '../stores/authStore';
import {
  SHARE_TEMPLATES,
  SHARE_HASHTAGS,
  type ShareCategory,
  type ShareChannel,
} from '@shared/constants/share-templates';

interface ShareData {
  title: string;
  text: string;
  url: string;
}

export function useShare() {
  const store = useShareStore();
  const user = useAuthStore((s) => s.user);

  const canUseWebShareAPI = typeof navigator !== 'undefined' && !!navigator.share;

  /** Build URL with referral attribution */
  const buildShareUrl = useCallback(
    (baseUrl: string, referralCode?: string): string => {
      const code = referralCode || user?.id?.replace(/[:]/g, '') || '';
      return code ? `${baseUrl}?ref=${code}` : baseUrl;
    },
    [user],
  );

  /** Build social media share URL for a given channel */
  const buildSocialUrl = useCallback((channel: ShareChannel, data: ShareData): string => {
    const text = encodeURIComponent(data.text);
    const url = encodeURIComponent(data.url);
    const title = encodeURIComponent(data.title);
    const hashtags = SHARE_HASHTAGS.map((h) => h.replace('#', '')).join(',');

    switch (channel) {
      case 'x_twitter':
        return `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      case 'whatsapp':
        return `https://wa.me/?text=${text}%20${url}`;
      case 'sms':
        return `sms:?body=${text}%20${url}`;
      case 'email':
        return `mailto:?subject=${title}&body=${text}%0A%0A${url}`;
      case 'copy_link':
        return data.url;
    }
  }, []);

  /** Attempt Web Share API, return false if unavailable */
  const nativeShare = useCallback(
    async (data: ShareData): Promise<boolean> => {
      if (!canUseWebShareAPI) return false;
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        });
        return true;
      } catch {
        return false;
      }
    },
    [canUseWebShareAPI],
  );

  /** Copy text to clipboard */
  const copyLink = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  /** High-level share action: try native, fall back to modal */
  const share = useCallback(
    async (category: ShareCategory, overrides?: { message?: string; referralCode?: string }) => {
      const template = SHARE_TEMPLATES[category];
      const url = buildShareUrl(template.url, overrides?.referralCode);
      const text = overrides?.message || template.message;

      const shared = await nativeShare({ title: template.title, text, url });
      if (!shared) {
        store.openShareModal(category, overrides);
      } else {
        store.recordShareEvent(category, 'copy_link');
      }
    },
    [buildShareUrl, nativeShare, store],
  );

  /** Open a specific social channel directly */
  const shareToChannel = useCallback(
    (
      category: ShareCategory,
      channel: ShareChannel,
      overrides?: { message?: string; referralCode?: string },
    ) => {
      const template = SHARE_TEMPLATES[category];
      const url = buildShareUrl(template.url, overrides?.referralCode);
      const text = overrides?.message || template.message;

      if (channel === 'copy_link') {
        copyLink(`${text} ${url}`);
      } else {
        const socialUrl = buildSocialUrl(channel, {
          title: template.title,
          text,
          url,
        });
        window.open(socialUrl, '_blank', 'noopener,noreferrer');
      }
      store.recordShareEvent(category, channel);
    },
    [buildShareUrl, buildSocialUrl, copyLink, store],
  );

  return {
    share,
    shareToChannel,
    copyLink,
    buildShareUrl,
    buildSocialUrl,
    canUseWebShareAPI,
    openShareModal: store.openShareModal,
    closeShareModal: store.closeShareModal,
    isShareModalOpen: store.isShareModalOpen,
    dismissBanner: store.dismissBanner,
    isBannerDismissed: store.isBannerDismissed,
  };
}

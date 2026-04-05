/**
 * Share Store — Zustand store for sharing modal state, dismissed banners,
 * and share event tracking.
 */
import { create } from 'zustand';
import type { ShareCategory, ShareChannel } from '@shared/constants/share-templates';

interface ShareEvent {
  category: ShareCategory;
  channel: ShareChannel;
  timestamp: string;
}

interface ShareState {
  /** Modal */
  isShareModalOpen: boolean;
  shareModalCategory: ShareCategory | null;
  shareModalCustomMessage: string | null;
  shareModalReferralCode: string | null;

  /** Dismissed banners — persisted in localStorage */
  dismissedBanners: string[];

  /** Session share events (in-memory) */
  shareEvents: ShareEvent[];

  /** Actions */
  openShareModal: (
    category: ShareCategory,
    opts?: { message?: string; referralCode?: string },
  ) => void;
  closeShareModal: () => void;
  dismissBanner: (bannerId: string) => void;
  isBannerDismissed: (bannerId: string) => boolean;
  recordShareEvent: (category: ShareCategory, channel: ShareChannel) => void;
}

function loadDismissedBanners(): string[] {
  try {
    return JSON.parse(localStorage.getItem('careos_dismissed_banners') || '[]');
  } catch {
    return [];
  }
}

export const useShareStore = create<ShareState>((set, get) => ({
  isShareModalOpen: false,
  shareModalCategory: null,
  shareModalCustomMessage: null,
  shareModalReferralCode: null,
  dismissedBanners: loadDismissedBanners(),
  shareEvents: [],

  openShareModal: (category, opts) =>
    set({
      isShareModalOpen: true,
      shareModalCategory: category,
      shareModalCustomMessage: opts?.message ?? null,
      shareModalReferralCode: opts?.referralCode ?? null,
    }),

  closeShareModal: () =>
    set({
      isShareModalOpen: false,
      shareModalCategory: null,
      shareModalCustomMessage: null,
      shareModalReferralCode: null,
    }),

  dismissBanner: (bannerId) => {
    const updated = [...get().dismissedBanners, bannerId];
    localStorage.setItem('careos_dismissed_banners', JSON.stringify(updated));
    set({ dismissedBanners: updated });
  },

  isBannerDismissed: (bannerId) => get().dismissedBanners.includes(bannerId),

  recordShareEvent: (category, channel) => {
    set((s) => ({
      shareEvents: [...s.shareEvents, { category, channel, timestamp: new Date().toISOString() }],
    }));
  },
}));

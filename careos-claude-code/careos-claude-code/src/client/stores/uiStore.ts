/**
 * UI Store — Navigation, modals, sidebar state
 */
import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  mobileNavVisible: boolean;
  activeModal: string | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileNavVisible: (visible: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  mobileNavVisible: true,
  activeModal: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileNavVisible: (visible) => set({ mobileNavVisible: visible }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
}));

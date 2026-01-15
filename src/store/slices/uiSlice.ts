import type { StateCreator } from 'zustand';
import type { Toast, Modal } from '@/types';

export interface UISlice {
  sidebarOpen: boolean;
  activeHelper: string | null;
  toasts: Toast[];
  modals: Modal[];

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveHelper: (helperId: string | null) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  openModal: (modal: Omit<Modal, 'id'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

export const createUISlice: StateCreator<UISlice> = (set, get) => ({
  sidebarOpen: true,
  activeHelper: null,
  toasts: [],
  modals: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setActiveHelper: (helperId) => set({ activeHelper: helperId }),

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  openModal: (modal) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ modals: [...state.modals, { ...modal, id }] }));
  },

  closeModal: (id) =>
    set((state) => ({ modals: state.modals.filter((m) => m.id !== id) })),

  closeAllModals: () => set({ modals: [] }),
});

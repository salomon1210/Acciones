"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
  commandOpen: boolean;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  onboardingSeen: boolean;
  setCommandOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  setMobileNavOpen: (v: boolean) => void;
  markOnboardingSeen: () => void;
  resetOnboarding: () => void;
};

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      commandOpen: false,
      sidebarCollapsed: false,
      mobileNavOpen: false,
      onboardingSeen: false,
      setCommandOpen: (v) => set({ commandOpen: v }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
      markOnboardingSeen: () => set({ onboardingSeen: true }),
      resetOnboarding: () => set({ onboardingSeen: false }),
    }),
    {
      name: "invcmd-ui",
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, onboardingSeen: s.onboardingSeen }),
    }
  )
);

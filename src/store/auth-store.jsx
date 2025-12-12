import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      // Initial State
      user: null,
      isLoggedIn: false,

      // Set State
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ isLoggedIn: false, user: null }),
    }),
    {
      name: "user-data", // storage key
    }
  )
);

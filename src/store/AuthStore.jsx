import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      // Initial State
      token: null,
      user: null,
      isLoggedIn: false,

      // Set State
      setToken: (token) => set({ token }),
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ token: null, isLoggedIn: false, user: null }),
    }),
    {
      name: "user-auth", // storage key
    }
  )
);

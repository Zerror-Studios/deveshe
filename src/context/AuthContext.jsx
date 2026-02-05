import React, { createContext, useContext } from "react";
import { useApolloClient } from "@apollo/client/react";
import { TokenManager } from "@/utils/tokenManager";
import { useAuthStore } from "@/store/auth-store";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const client = useApolloClient();
  const { clearAuth } = useAuthStore((state) => state);
  const logout = async () => {
    try {
      TokenManager.clearTokens();
      clearAuth();
      localStorage.removeItem("user-data");
      await client.clearStore();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};

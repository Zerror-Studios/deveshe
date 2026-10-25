import React, { createContext, useContext } from "react";
import { useApolloClient } from "@apollo/client/react";
import { CustomerSession } from "@/lib/customer-session.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const client = useApolloClient();

  // Revokes the cookie session, clears the token, the profile and the cache.
  const logout = async () => {
    try {
      await CustomerSession.logout(client);
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

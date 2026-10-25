import React, { createContext, useContext, useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { GET_MY_PROFILE } from "@/graphql";
import { CustomerSession } from "@/lib/customer-session.service";
import { useAuthStore } from "@/store/auth-store";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const client = useApolloClient();

  // The profile isn't persisted (PRD-014 FE-12): reload it after a page
  // reload. The auth link refreshes the token before this query goes out;
  // a refused session is cleared there.
  useEffect(() => {
    const { isLoggedIn, user } = useAuthStore.getState();
    if (!isLoggedIn || user) return;
    client
      .query({ query: GET_MY_PROFILE, fetchPolicy: "network-only" })
      .then(({ data }) => {
        const state = useAuthStore.getState();
        if (data?.getMyProfile && state.isLoggedIn) {
          state.setUser(data.getMyProfile);
        }
      })
      .catch(() => {
        // Transient errors keep the hint; the next page load retries.
      });
  }, [client]);

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

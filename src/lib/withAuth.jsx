import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/auth-store";

const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const { token, isLoggedIn } = useAuthStore((state) => state);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
      setIsHydrated(true);
    }, []);

    useEffect(() => {
      if (isHydrated && (!token || !isLoggedIn)) {
        router.push("/login");
      }
    }, [token, isLoggedIn, isHydrated]);

    if (!isHydrated) return null;

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;

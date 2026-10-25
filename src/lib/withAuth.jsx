import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/auth-store";
import { getLoginPath } from "@/utils/redirect.util";

// Client-side guard; `middleware.js` already redirects when there is no
// session cookie, this handles a session that ended in the browser.
const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const { isLoggedIn } = useAuthStore((state) => state);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
      setIsHydrated(true);
    }, []);

    useEffect(() => {
      if (isHydrated && !isLoggedIn) {
        router.replace(getLoginPath(router.asPath));
      }
    }, [isLoggedIn, isHydrated]);

    if (!isHydrated || !isLoggedIn) return null;

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;

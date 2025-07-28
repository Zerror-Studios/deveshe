import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const useVisitor = () => {
  const [visitorId, setVisitorId] = useState(null);
  const [visitorExpire, setVisitorExpire] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userAuth = localStorage.getItem("user-auth");
    const isLoggedIn = userAuth && JSON.parse(userAuth)?.state?.isLoggedIn;

    if (isLoggedIn) return;

    const storedVisitorId = localStorage.getItem("visitorId");
    const storedExpire = localStorage.getItem("visitorExpire");
    const now = new Date();

    const isExpired = !storedExpire || new Date(storedExpire) < now;

    if (!storedVisitorId || isExpired) {
      const newVisitorId = uuidv4();
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 7);

      localStorage.setItem("visitorId", newVisitorId);
      localStorage.setItem("visitorExpire", expireDate.toISOString());

      setVisitorId(newVisitorId);
      setVisitorExpire(expireDate.toISOString());
    } else {
      setVisitorId(storedVisitorId);
      setVisitorExpire(storedExpire);
    }
  }, []);

  return { visitorId, visitorExpire };
};

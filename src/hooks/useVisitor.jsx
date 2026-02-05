import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const useVisitor = () => {
  const [visitorId, setVisitorId] = useState(null);
  const [visitorExpire, setVisitorExpire] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedVisitorId = localStorage.getItem("visitorId");

    // Always extend expiration on visit (Sliding Expiration)
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);
    const newExpireIso = expireDate.toISOString();

    if (storedVisitorId) {
      // If ID exists, reuse it and just extend the session
      setVisitorId(storedVisitorId);
      setVisitorExpire(newExpireIso);
      localStorage.setItem("visitorExpire", newExpireIso);
    } else {
      // If no ID, generate new one
      const newVisitorId = uuidv4();
      setVisitorId(newVisitorId);
      setVisitorExpire(newExpireIso);

      localStorage.setItem("visitorId", newVisitorId);
      localStorage.setItem("visitorExpire", newExpireIso);
    }
  }, []);

  return { visitorId, visitorExpire };
};

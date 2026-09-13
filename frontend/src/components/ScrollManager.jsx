import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollManager() {
  const { pathname, search, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1));
      target?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, search, hash, key]);

  return null;
}

export default ScrollManager;

// src/hooks/usePointerGlow.js
import { useEffect, useState } from "react";

export const usePointerGlow = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const syncPointer = ({ x: pointerX, y: pointerY }) => {
      const x = pointerX.toFixed(2);
      const y = pointerY.toFixed(2);
      const xp = (pointerX / window.innerWidth).toFixed(2);
      const yp = (pointerY / window.innerHeight).toFixed(2);
      document.documentElement.style.setProperty("--x", x);
      document.documentElement.style.setProperty("--xp", xp);
      document.documentElement.style.setProperty("--y", y);
      document.documentElement.style.setProperty("--yp", yp);
      setStatus({ x, y, xp, yp });
    };

    document.body.addEventListener("pointermove", syncPointer);
    return () => {
      document.body.removeEventListener("pointermove", syncPointer);
    };
  }, []);

  return [status];
};

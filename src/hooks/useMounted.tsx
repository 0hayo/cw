import { useRef, useEffect } from "react";

const useMounted = () => {
  const mounted = useRef(true);
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);
  return mounted;
};

export default useMounted;

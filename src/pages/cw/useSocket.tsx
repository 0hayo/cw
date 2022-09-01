import { Socket } from "net";
import { useRef, useEffect } from "react";

const useSocket = () => {
  const ref = useRef<Socket>();
  useEffect(() => {
    const socket = ref.current;
    return () => {
      socket && socket.end();
    };
  }, []);
  return ref;
};

export default useSocket;

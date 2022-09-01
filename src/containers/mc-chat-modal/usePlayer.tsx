import { Socket } from "net";
import exec from "services/exec";
import message from "misc/message";
import useMounted from "hooks/useMounted";
import { useCallback, useRef, useState, useEffect } from "react";

interface IData {
  played: number;
  active: boolean;
}

const usePlayer = (): {
  played: number;
  active: boolean;
  stop: VoidFunction;
  play: (file: string, offset: number, length: number) => void;
} => {
  const tid = useRef(0);
  const mounted = useMounted();
  const socket = useRef<Socket>();
  const [data, setData] = useState<IData>({
    played: 0,
    active: false,
  });

  const play = useCallback(
    (file: string, offset: number, length: number) => {
      window.cancelAnimationFrame(tid.current);
      socket.current && socket.current.end();

      socket.current = exec(`playback -file ${file} -offset ${offset} -length ${length}`, {
        onClose: () => {
          if (mounted.current) {
            setData(x => ({
              ...x,
              active: false,
            }));
          }
        },
        onError: () => {
          if (mounted.current) {
            window.clearTimeout(tid.current);
            socket.current && socket.current.end();
            message.failure("播放失败", "连接错误");
            setData(x => ({
              ...x,
              active: false,
            }));
          }
        },
        onReady: () => {
          if (mounted.current) {
            const tick = Date.now();
            const next = () => {
              tid.current = window.setTimeout(() => {
                if (mounted.current) {
                  const diff = Date.now() - tick;
                  const seek = ((diff * 16) / length) * 100;

                  setData(x => ({
                    ...x,
                    played: Math.min(100, seek),
                  }));

                  if (seek < 100) {
                    next();
                  }
                }
              }, 500);
            };

            setData({
              played: 0,
              active: true,
            });

            next();
          }
        },
      });
    },
    [mounted]
  );

  const stop = useCallback(() => {
    window.clearTimeout(tid.current);
    socket.current && socket.current.end();
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(tid.current);
      socket.current && socket.current.end();
    };
  }, []);

  return {
    play,
    stop,
    played: data.played,
    active: data.active,
  };
};

export default usePlayer;

import { index2field } from "misc/util";
import { Socket } from "net";
import exec from "services/exec";
import message from "misc/message";
import useMounted from "hooks/useMounted";
import { useCallback, useRef, useState, useEffect } from "react";
import { max, size } from "misc/telegram";

interface IData {
  played: number;
  active: boolean;
}

const usePlayer = (
  count: number
): {
  played: number;
  active: boolean;
  stop: VoidFunction;
  play: (file: string, word: McTelegramWord) => void;
  pipe: (
    file: string,
    role: "head" | "body",
    type: TelegramBizType,
    hash: McTelegramHash,
    index: number,
    onNext: (index: number, active: number) => void
  ) => void;
} => {
  const tid = useRef(0);
  const mounted = useMounted();
  const socket = useRef<Socket>();
  const [data, setData] = useState<IData>({
    played: 0,
    active: false,
  });

  const pipe = useCallback(
    (
      file: string,
      role: "head" | "body",
      type: TelegramBizType,
      hash: McTelegramHash,
      index: number,
      onNext: (index: number, active: number) => void
    ) => {
      window.cancelAnimationFrame(tid.current);
      socket.current && socket.current.end();

      const word = hash[index2field(index, type, role)];
      const maxIdx = role === "body" ? max(hash) : size(hash);
      if (word && word.offset && word.length) {
        const { offset: startOffset } = word;
        const lastOffset = hash[index2field(maxIdx, type, role)]?.offset || 0;
        const lastLen = hash[index2field(maxIdx, type, role)]?.length || 0;
        const audioLen = lastOffset + lastLen - startOffset;

        socket.current = exec(`playback -file ${file} -offset ${startOffset} -length ${audioLen}`, {
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
              window.cancelAnimationFrame(tid.current);
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
              let currIndex = index;
              let currOffsetIndex = index;
              let currActive = 0;
              const next = () => {
                const currWord = hash[index2field(currIndex, type, role)];
                // 播放到最后一组就返回
                if (!currWord) {
                  setData(x => ({
                    ...x,
                    active: false,
                  }));
                  return;
                }
                const currOffset = currWord ? currWord.offset || 0 : 0;
                const currLength = currWord ? currWord.length || 0 : 0;
                const currEnd = currOffset + currLength;

                tid.current = window.requestAnimationFrame(() => {
                  if (mounted.current) {
                    const diff = Date.now() - tick;
                    const diffStep = diff * 16;
                    const passed = diffStep + startOffset;
                    const seek = (diffStep / audioLen) * 100;

                    setData(x => ({
                      ...x,
                      played: Math.min(100, seek),
                    }));

                    if (passed > currEnd) {
                      currIndex++;
                      if (!hash[index2field(currIndex, type, role)]) {
                        setData(x => ({
                          ...x,
                          active: false,
                        }));
                        return;
                      }
                      currActive++;
                      if (currActive >= count) {
                        currActive = 0;
                        currOffsetIndex = currIndex;
                      }
                      // const next = hash[index2field(currIndex, type, role)];
                      if (tid.current !== -1) {
                        onNext(currOffsetIndex, currActive);
                      }
                    }

                    if (seek < 100) {
                      next();
                    }
                  }
                });
              };

              setData({
                played: 0,
                active: true,
              });

              next();
            }
          },
        });
      }
    },
    [mounted, count]
  );

  const play = useCallback(
    (file: string, word: McTelegramWord) => {
      window.cancelAnimationFrame(tid.current);
      socket.current && socket.current.end();

      const { offset, length } = word;
      if (offset && length) {
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
              window.cancelAnimationFrame(tid.current);
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
                tid.current = window.requestAnimationFrame(() => {
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
                });
              };

              setData({
                played: 0,
                active: true,
              });

              next();
            }
          },
        });
      }
    },
    [mounted]
  );

  const stop = useCallback(() => {
    window.cancelAnimationFrame(tid.current);
    socket.current && socket.current.end();
    tid.current = -1;
  }, []);

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(tid.current);
      socket.current && socket.current.end();
      tid.current = -1;
    };
  }, []);

  return {
    pipe,
    play,
    stop,
    played: data.played,
    active: data.active,
  };
};

export default usePlayer;

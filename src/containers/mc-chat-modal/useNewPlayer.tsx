import { Socket } from "net";
// import exec from "services/exec";
// import message from "misc/message";
// import useMounted from "hooks/useMounted";
import { useCallback, useRef, useState } from "react";
// import pcm from "pcm-util";
import PCMPlayer from "pcm-player";
import { bizServerAddress, getControlRadio, kPORT } from "misc/env";
import { EOL } from "os";

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
  // const SAMPLE_RATE = 16000;
  const SAMPLE_RATE = 6000;
  // const BIT_DEPTH = 16;
  /** 每秒采样的BYTE数量 */
  // const BYTE_PER_SECOND = SAMPLE_RATE * (BIT_DEPTH / 8);

  const tid = useRef(0);
  // const mounted = useMounted();
  // const socket = useRef<Socket>();
  const [data, setData] = useState<IData>({
    played: 0,
    active: false,
  });
  const playerRef = useRef<PCMPlayer>();
  const socketRef = useRef<Socket>();

  const play = useCallback((file: string, offset: number, length: number) => {
    window.cancelAnimationFrame(tid.current);
    socketRef.current && socketRef.current.end();

    if (!playerRef.current) {
      playerRef.current = new PCMPlayer({
        inputCodec: "Int16",
        channels: 1,
        sampleRate: SAMPLE_RATE,
        flushTime: 5,
      });
    } else {
      playerRef.current.continue();
    }
    playerRef.current.volume(0.5);

    const cmd = `playback -file ${file} -offset ${offset} -length ${length} -ip=${
      getControlRadio().ip
    } -radioUuid=${getControlRadio().radioUuid}`;
    socketRef.current = new Socket();
    // socketRef.current = _socket;
    socketRef.current.connect(kPORT, bizServerAddress, () => {
      socketRef.current.write(cmd + EOL);
    });
    //收到服务器端传入的音频流时（PCM二进制格式），转换为AudioBuffer并通过本地播放
    socketRef.current.on("data", buffer => {
      let newBuffer = buffer;
      const len = buffer.byteLength;
      console.debug("收到业务服务器传来的PCM流，开始播放！！！" + len);
      if (len % 2 !== 0) {
        console.debug("处理长度不为偶数的buffer 1---------", newBuffer.length);
        newBuffer = Buffer.from(buffer, 0, len - 1);
        console.debug("处理长度不为偶数的buffer 2---------", newBuffer.length);
      } else {
        console.debug("play" + len);
      }
      playerRef.current.feed(newBuffer);
    });

    setData({
      played: 0,
      active: true,
    });
  }, []);

  const stop = useCallback(() => {
    // window.clearTimeout(tid.current);
    // alert(1);
    //   playerRef.current.
    playerRef.current?.pause();
    // playerRef.current?.destroy();
    playerRef.current?.destroy();
    playerRef.current = null;
    socketRef.current?.end();
    // socketRef.current && socketRef.current.end();
    setData({
      played: 0,
      active: false,
    });
  }, []);

  // useEffect(() => {
  //   return () => {
  //     window.clearTimeout(tid.current);
  //     socketRef.current && socketRef.current.end();
  //   };
  // }, []);

  return {
    play,
    stop,
    played: data.played,
    active: data.active,
  };
};

export default usePlayer;

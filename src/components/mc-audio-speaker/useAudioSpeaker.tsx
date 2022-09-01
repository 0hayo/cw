import { useCallback, useEffect, useRef } from "react";
import { bizServerAddress, getControlRadio, kPORT } from "misc/env";
import { Socket } from "net";
import pcm from "pcm-util";
import PCMPlayer from "pcm-player";
import { EOL } from "os";

const SAMPLE_RATE = 6000;
const BIT_DEPTH = 16;
/** 每秒采样的BYTE数量 */
const BYTE_PER_SECOND = SAMPLE_RATE * (BIT_DEPTH / 8);

//用于控制全局的静音开关
let MUTE = localStorage.getItem("SPEAKER-MUTE") === "ON" ? true : false;

/**
 * 用于接收并播放远程服务器传来的音频流
 */
const useAudioSpeaker = (
  onStop?: () => void
): {
  /** 开始收听远程(服务器)传来的音频流 */
  startListen: () => void;
  /** 停止收听远程(服务器)传来的音频流 */
  stopListen: () => void;
  /** 播放给定的PCM音频Buffer或base64 string（用于本地录音回放） */
  play: (data: Buffer | string) => void;
  /** 停止播放 */
  stop: () => void;
  /** 静音（不断开连接） */
  mute: (flag: boolean) => void;
  /** 获取音频时长 */
  getDuration: (data: Buffer | string) => string;
} => {
  // const acRef = useRef<AudioContext>();
  const socketRef = useRef<Socket>();
  const sourceRef = useRef<AudioBufferSourceNode>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const acRef = useRef<AudioContext>();
  const playerRef = useRef<PCMPlayer>();

  const startListen = useCallback(() => {
    // sourceRef.current = acRef.current.createBufferSource();
    // sourceRef.current.connect(acRef.current.destination); //选择系统默认音频输出设备
    //先确保之前的socket已断开
    if (socketRef.current && !socketRef.current.destroyed) {
      return;
      // socketRef.current.end();
      // socketRef.current.destroy();
    }
    //连接至业务服务器的音频接收socket端口
    const _socket = new Socket();
    _socket.on("error", () => {
      console.error("连接到服务器音频(接收)接口错误！");
    });
    _socket.on("close", () => {
      console.info("到服务器音频(接收)接口的连接已关闭！", bizServerAddress, ":", kPORT);
      //_socket.resume();
    });
    _socket.on("pause", () => {
      console.info("到服务器音频(接收)接口的连接已暂停接收音频流！", bizServerAddress, ":", kPORT);
    });

    _socket.on("resume", () => {
      console.info("到服务器音频(接收)接口的连接已恢复接收音频流！", bizServerAddress, ":", kPORT);
    });

    _socket.connect(kPORT, bizServerAddress, () => {
      console.info("已连接到服务器音频(接收)接口 ", bizServerAddress, ":", kPORT);
      const cmd = `playingradio -ip=${getControlRadio().ip} -radioUuid=${
        getControlRadio().radioUuid
      }${EOL}`;
      _socket.write(cmd);
      console.info("发送音频播放指令完成：", cmd);
    });

    if (!playerRef.current) {
      playerRef.current = new PCMPlayer({
        inputCodec: "Int16",
        channels: 1,
        sampleRate: SAMPLE_RATE,
        flushTime: 0,
      });
    }
    playerRef.current.volume(1.0);

    //收到服务器端传入的音频流时（PCM二进制格式），转换为AudioBuffer并通过本地播放
    _socket.on("data", buffer => {
      console.debug("收到业务服务器传来的PCM流，", "MUTE = ", MUTE, buffer.length);
      if (MUTE) return;
      let newBuffer = buffer;
      const len = buffer.byteLength;
      if (len % 2 !== 0) {
        console.debug("处理长度不为偶数的buffer 1---------", newBuffer.length);
        newBuffer = Buffer.from(buffer, 0, len - 1);
        console.debug("处理长度不为偶数的buffer 2---------", newBuffer.length);
      }
      playerRef.current.feed(newBuffer);
    });
    socketRef.current = _socket;
  }, []);

  const stopListen = useCallback(() => {
    //干掉所有已创建和连接的资源
    console.info("主动关闭到服务器音频(接收)接口", bizServerAddress, ":", kPORT);
    const _stop = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      if (acRef.current) {
        acRef.current.close();
      }
      releaseResources();
    };
    setTimeout(_stop, 500);
  }, []);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
    }
    onStop && onStop();
    timeoutRef.current && clearTimeout(timeoutRef.current);
  }, [onStop]);

  /** 播放给定的PCM音频Buffer或base64 string（用于本地录音回放） */
  const play = useCallback(
    (data: Buffer | string) => {
      const timeLen = data.length;
      console.log("正在播放录制的声音。。。。。。。。。", timeLen);
      if (!data) return;
      const pcmData = typeof data === "string" ? Buffer.alloc(data.length, data, "base64") : data;
      //通过pcm工具转为AudioBuffer
      const audioBuffer: AudioBuffer = pcm.toAudioBuffer<AudioBuffer>(pcmData, {
        channels: 1,
        sampleRate: SAMPLE_RATE,
      });
      !acRef.current &&
        (acRef.current = new AudioContext({
          sampleRate: SAMPLE_RATE,
          latencyHint: "playback",
        }));
      //还需要进一步转换
      const sdBuffer = acRef.current.createBuffer(1, audioBuffer.length, SAMPLE_RATE);
      sourceRef.current = acRef.current.createBufferSource();
      sourceRef.current.connect(acRef.current.destination); //选择系统默认音频输出设备
      sdBuffer.getChannelData(0).set(audioBuffer.getChannelData(0));
      console.log("audioBuffer length=", audioBuffer.length);
      console.log("sdBuffer length=", sdBuffer.length);
      //将转换后的AudioBuffer置入并播放
      const audioLenSeconds = audioBuffer.length / 10000;
      sourceRef.current.buffer = sdBuffer;
      sourceRef.current.start(0, 0, audioLenSeconds);
      sourceRef.current.addEventListener("ended", onStop);
    },
    [onStop]
  );

  const getSeconds = (data: Buffer | string): number => {
    if (!data) return 0;
    const pcmData = typeof data === "string" ? Buffer.alloc(data.length, data, "base64") : data;
    const len = pcmData.byteLength;
    //根据音频字节数计算播放长度:
    const totalSeconds = len / BYTE_PER_SECOND;
    return totalSeconds;
  };

  const getDuration = (data: Buffer | string) => {
    if (!data) return "0’00”";
    //根据音频字节数计算播放长度:
    const totalSeconds = getSeconds(data);
    const minutes = Math.round(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
    return `${minutes <= 0 ? "" : minutes + "’"}${seconds}”`;
  };

  const mute = (flag: boolean) => {
    MUTE = flag;
    localStorage.setItem("SPEAKER-MUTE", flag ? "ON" : "OFF");
  };

  useEffect(() => {
    //组件卸载时释放资源
    return () => {
      console.log("useAudioSpeaker: -----release resources.......");
      releaseResources();
      console.log("useAudioSpeaker: -----release resources....... ok");
    };
  }, []);

  const releaseResources = () => {
    if (socketRef.current) {
      socketRef.current.end();
      socketRef.current.destroy();
      socketRef.current = null;
    }
  };

  return {
    startListen,
    stopListen,
    play,
    stop,
    mute,
    getDuration,
  };
};

export default useAudioSpeaker;

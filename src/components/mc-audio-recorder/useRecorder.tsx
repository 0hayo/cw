import { useCallback, useEffect, useRef } from "react";
import pcm from "pcm-util";
import { Socket } from "net";
import { bizServerAddress, audioSendSocketPort } from "misc/env";
// import PCMPlayer from "pcm-player";

const BUFFER_SIZE = 1024;
const SAMPLE_RATE = 8000;
const PCM_FORMAT = {
  signed: true,
  float: false,
  bitDepth: 16,
  // byteOrder: "LE",
  channels: 1,
  sampleRate: SAMPLE_RATE,
  interleaved: false,
  // samplesPerFrame: 1024,
};

const useRecorder = (): {
  /**
   * 开始录音
   * 如果realtime === true, 则录制的音频转为PCM格式后，直接以流的方式透传至后台服务器
   * 如果realtime === false,则录制的音频转为PCM格式的buffer，
   */
  start: (realtime: boolean) => void;
  /**
   * 停止录音
   * 如果realtime === false,则录制的音频转为PCM格式的Buffer返回
   */
  stop: (realtime: boolean, format: "raw" | "base64") => Buffer | string;
  /**
   * 回放录制的音频
   * @buffer PCM格式的音频转换得到的Buffer或string对象
   */
  playback: (data: Buffer | string) => void;
} => {
  const acRef = useRef<AudioContext>();
  const sourceRef = useRef<MediaStreamAudioSourceNode>();
  const scriptNodeRef = useRef<ScriptProcessorNode>();
  const destRef = useRef<MediaStreamAudioDestinationNode>();
  const socketRef = useRef<Socket>();
  const recordBufferRef = useRef<Buffer>();

  const start = useCallback(async (realtime: boolean) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream: MediaStream) => {
      !acRef.current &&
        (acRef.current = new AudioContext({
          sampleRate: SAMPLE_RATE,
          latencyHint: "playback",
        }));

      !sourceRef.current && (sourceRef.current = acRef.current.createMediaStreamSource(stream));

      //构造参数依次为缓冲区大小，输入通道数，输出通道数
      !scriptNodeRef.current &&
        (scriptNodeRef.current = acRef.current.createScriptProcessor(BUFFER_SIZE, 1, 1));

      //创建音频处理的输出节点
      !destRef.current && (destRef.current = acRef.current.createMediaStreamDestination());

      //串联连接
      sourceRef.current.connect(scriptNodeRef.current);
      // scriptNodeRef.current.connect(acRef.current.destination); //直接输出到默认音频播放设备
      scriptNodeRef.current.connect(destRef.current);

      //先确保之前的socket已断开
      if (socketRef.current && !socketRef.current.destroyed) {
        socketRef.current.end();
        socketRef.current.destroy();
      }
      if (realtime && !socketRef.current) {
        const _socket = new Socket();
        _socket.on("error", () => {
          console.error("连接到服务器音频(发送)接口错误！");
        });
        _socket.on("close", () => {
          console.info("到服务器音频(发送)接口的连接已关闭！");
        });
        _socket.connect(audioSendSocketPort, bizServerAddress, () => {
          console.info("已连接到服务器音频(发送)接口 ", bizServerAddress, ":", audioSendSocketPort);
        });
        socketRef.current = _socket;
      } else {
        recordBufferRef.current = Buffer.alloc(0);
      }

      //添加事件处理
      scriptNodeRef.current.onaudioprocess = audioProcessingEvent => {
        //输入流位置
        var inputBuffer = audioProcessingEvent.inputBuffer;
        //转换为PCM格式
        const pcmBuffer = pcm.toArrayBuffer(inputBuffer, PCM_FORMAT);

        const buffer = Buffer.from(pcmBuffer);
        if (realtime) {
          socketRef.current && socketRef.current.write(buffer);
        } else {
          recordBufferRef.current = Buffer.concat([recordBufferRef.current, buffer]);
        }
      }; // end of onaudioprocess()
    });
  }, []);

  const stop = useCallback((realtime: boolean, format: "raw" | "base64") => {
    releaseResources();
    if (!realtime && recordBufferRef.current && recordBufferRef.current.length > 0) {
      return format === "raw"
        ? recordBufferRef.current
        : recordBufferRef.current.toString("base64");
    }
    return null;
  }, []);

  /** pcm-player 播放方式，音质有点差 */
  // const playback2 = useCallback(async (data: Buffer | string) => {
  //   const pcmData = typeof data === "string" ? Buffer.alloc(data.length, data, "base64") : data;
  //   var player = new PCMPlayer({
  //     inputCodec: "Int16",
  //     channels: 1,
  //     sampleRate: 8000,
  //     flushTime: 0,
  //   });
  //   player.volume(0.5);
  //   player.feed(pcmData);
  // }, []);

  /** pcm-utils转换成AudioBuffer播放，音质较好 */
  const playback = useCallback(async (data: Buffer | string) => {
    if (!data) return;
    const pcmData = typeof data === "string" ? Buffer.alloc(data.length, data, "base64") : data;
    const context = new AudioContext({
      sampleRate: SAMPLE_RATE,
      latencyHint: "playback",
    });
    //通过pcm工具转为AudioBuffer
    const audioBuffer: AudioBuffer = pcm.toAudioBuffer<AudioBuffer>(pcmData, {
      channels: 1,
      sampleRate: SAMPLE_RATE,
    });
    //还需要进一步转换
    const sdBuffer = context.createBuffer(1, audioBuffer.length, SAMPLE_RATE);
    const source = context.createBufferSource();
    source.connect(context.destination); //选择系统默认音频输出设备
    sdBuffer.getChannelData(0).set(audioBuffer.getChannelData(0));
    //将转换后的AudioBuffer置入并播放
    source.buffer = sdBuffer;
    source.start(0);
  }, []);

  useEffect(() => {
    //初始化时创建AudioContext实例
    !acRef.current &&
      (acRef.current = new AudioContext({
        sampleRate: SAMPLE_RATE,
        latencyHint: "playback",
      }));
    //组件卸载时释放资源
    return () => {
      releaseResources();
      if (acRef.current) {
        acRef.current.suspend();
        acRef.current.close();
        acRef.current = null;
      }
    };
  }, []);

  const releaseResources = () => {
    if (destRef.current) {
      destRef.current.disconnect();
      destRef.current = null;
    }
    if (scriptNodeRef.current) {
      scriptNodeRef.current.disconnect();
      scriptNodeRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.end();
      socketRef.current.destroy();
      socketRef.current = null;
    }
  };

  return { start, stop, playback };
};

export default useRecorder;

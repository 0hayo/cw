import { bizServerAddress, getControlRadio, kPORT } from "misc/env";
import { Socket } from "net";
import { EOL } from "os";
import { useEffect, useRef } from "react";

const usePCMSocket = (onData: (buffer: Buffer) => void): Socket => {
  const socketRef = useRef<Socket>();

  useEffect(() => {
    //复用已连接的socket
    if (socketRef.current && !socketRef.current.destroyed) {
      return;
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

    //当有PCM音频流写入时，调用给定的回调函数
    _socket.on("data", buffer => {
      onData(buffer);
    });
  }, [onData]);

  useEffect(() => {
    const _socket = socketRef.current;
    //关闭socket
    return () => {
      _socket && _socket.end();
    };
  }, []);

  return socketRef.current;
};

export default usePCMSocket;

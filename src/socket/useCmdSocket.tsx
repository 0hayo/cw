import { useCallback, useEffect, useRef } from "react";
import { getAppType, localUse, _1t6Config } from "misc/env";
import message from "misc/message";
import { Socket } from "net";
import { EOL } from "os";
import { createInterface, Interface } from "readline";
import { Bus } from "misc/bus";

process.setMaxListeners(0); //设置listener上限为无限
interface ReaderMap {
  [uuid: string]: Interface;
}

const useCmdSocket = (bus: Bus): MstSocket => {
  const socket = useRef<Socket>(null);
  const readerMap = useRef<ReaderMap>({});
  const appType = getAppType();
  const port = appType === "control" ? _1t6Config.controlSocketPort : _1t6Config.terminalSocketPort;
  const serverAddress = localUse ? "localhost" : _1t6Config.bizServerAddress;

  const register = useCallback(
    (uuid: string) => {
      if (!socket.current) return;
      const _reader = createInterface({ input: socket.current });
      // console.log("create reader.............", uuid, _reader);

      // _reader.on("close", () => {
      //   console.log("reader closed...........", uuid, _reader);
      // });

      _reader.on("line", async line => {
        const json = JSON.parse(line);
        console.debug(uuid, "收到业务服务器的响应信息：", json);
        const cmd = json.cmd;
        const rc = json.rc;
        const radioUuid = json.radioUuid;
        const data = json.data;
        const message = json.message;
        const timestamp = json.timestamp;
        const ackData: AckData = {
          cmd,
          rc,
          radioUuid: radioUuid,
          data,
          message,
          timestamp,
        };
        /** call ack handler through event bus */
        bus.emit(`mst-${uuid}:${cmd}`, ackData);
      });

      readerMap.current[uuid] = _reader;
      return _reader;
    },
    [bus]
  );

  const connect = useCallback(() => {
    if (socket.current) {
      socket.current.destroy();
    }

    const connType =
      appType === "control"
        ? "服务器总控"
        : appType === "terminal"
        ? "服务器终端控制"
        : "等幅报服务控制";
    const _socket = new Socket();

    _socket.on("error", e => {
      console.log(`连接到${connType}端口[${port}]错误：`, e);
      if (appType !== "single") {
        message.destroy();
        message.failure(`连接到${connType}端口错误！`);
        setTimeout(() => {
          connect();
          //重新注册现有的listeners
          Object.keys(readerMap.current).map(key => {
            const oldReader = readerMap.current[key];
            if (oldReader) {
              oldReader.removeAllListeners();
            }
            readerMap.current[key] = register(key);
            return key;
          });
        }, 3000);
      }
    });

    _socket.on("close", () => {
      if (appType !== "single") {
        message.destroy();
        message.failure(`到${connType}端口的连接已关闭！`);
      }
    });

    // _socket.on("resume", () => {
    //   message.destroy();
    //   message.success("到服务器控制接口的连接已恢复！");
    //   Object.values(readerMap.current).map(it => {
    //     if(it) {
    //       it.resume();
    //     }
    //     return it;
    //   });
    // });

    _socket.connect(port, serverAddress, () => {
      if (appType !== "single") {
        message.destroy();
        message.success(`已连接到${connType}端口。`);
      }
    });
    _socket.setTimeout(3000);
    socket.current = _socket;

    //resume readers
    // Object.keys(readerMap.current).map(key => {
    //   const oldReader = readerMap.current[key];
    //   if (oldReader) {
    //     oldReader.close();
    //   }
    //   readerMap.current[key] = register(key);
    //   return key;
    // });
  }, [register, appType, port, serverAddress]);

  useEffect(() => {
    if (
      !socket.current ||
      socket.current.destroyed ||
      !socket.current.readable ||
      !socket.current.writable
    ) {
      connect();
    }
  }, [connect]);

  /** 发送Socket 指令到业务服务器 */
  const send = useCallback(
    async (cmd: Command) => {
      //检测socket有效性，并恢复重连
      if (
        !socket.current ||
        socket.current.destroyed ||
        !socket.current.readable ||
        !socket.current.writable
      ) {
        console.log(`到服务器的socket连接[${serverAddress}:${port}]已关闭，重新连接中...`);
        connect();
      }
      console.debug("发送命令:", cmd);
      socket.current.write(JSON.stringify(cmd) + EOL);
    },
    [connect, port, serverAddress]
  );

  const unregister = useCallback((uuid: string) => {
    const _reader = readerMap.current[uuid];
    console.log(uuid, "clean socket reader:", _reader);
    if (_reader) {
      // _reader.close(); //!!!会导致socket连接的读取失效（非关闭）
      _reader.removeAllListeners(); //正确做法
      readerMap.current[uuid] = null;
      delete readerMap.current[uuid];
    }
  }, []);

  return { send, register, unregister, connect };
};

export default useCmdSocket;

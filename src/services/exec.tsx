import { EOL } from "os";
import { Socket } from "net";
import { createInterface } from "readline";
import { bizServerAddress, kPORT, getControlRadio, localUse, LOCAL_MACHINE_ID } from "misc/env";

export interface Options {
  onData: (data: any) => void;
  onReady: VoidFunction;
  onError: VoidFunction;
  onClose: VoidFunction;
}

const exec = (cmd: string, ops: Partial<Options>): Socket => {
  const socket = new Socket();
  const reader = createInterface({ input: socket });
  const { radioUuid, ip } = localUse
    ? { radioUuid: LOCAL_MACHINE_ID, ip: "localhost" }
    : getControlRadio();
  const bizServerIp = localUse ? "localhost" : bizServerAddress;

  socket.on("error", error => {
    console.error(error);
    ops.onError && ops.onError();
  });
  socket.on("close", () => ops.onClose && ops.onClose());
  reader.on("line", x => {
    if (x) {
      ops.onData && ops.onData(JSON.parse(x));
    }
  });

  // 建立连接
  socket.connect(kPORT, bizServerIp, () => {
    const cmdStr = `${cmd} -ip=${ip} -radioUuid=${radioUuid}`;
    console.debug(`exec morse command:----(${bizServerIp}:${kPORT})-->>>>>>>>>>:`, cmdStr);
    socket.write(cmdStr + EOL);
    ops.onReady && ops.onReady();
  });

  return socket;
};

export default exec;

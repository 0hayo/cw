import React, { FC, useMemo, useState, useEffect } from "react";
import { Layout } from "antd";
import McConnectionConfigModal from "components/mc-config-modal";
import MstContext from "containers/mst-context/context";
import McRouter from "containers/mc-router";
import McRouterTerminal from "containers/mc-router/terminal-router";
import store from "store";
import useBus from "hooks/useBus";
import useInit from "./useInit";
import { ipcRenderer, remote } from "electron";
import qs from "query-string";
import McRouterSingle from "containers/mc-router/single-router";
import useCmdSocket from "socket/useCmdSocket";
import { getAppType, LOCAL_MACHINE_ID, bizServerAddress, localUse } from "misc/env";
import { exec } from "child_process";
interface IProps {
  appType: AppType; //加载“终端侧”还是“控制端”或“单机版”应用
}

const McApp: FC<IProps> = ({ appType = "single" }) => {
  const [radioUuid, setRadioUuid] = useState<string>(LOCAL_MACHINE_ID);
  const [contactId, setContactId] = useState<number>();
  const [station, setStation] = useState<MstLocalStation>({
    uuid: "",
    name: "",
    code: "",
    logo: "",
  });
  // const [radioUuid, setRadioUuid] = useState("");
  const bus = useBus();
  useInit(setStation);
  const socket = useCmdSocket(bus);

  const contextMemo = useMemo(() => {
    const redirectUrl = remote.getGlobal("sharedObject")?.redirectUrl;
    let targetRadioIp = bizServerAddress;
    if (redirectUrl) {
      console.log("mc-app: redirectUrl ===", redirectUrl);
      const search = qs.parse(redirectUrl);
      targetRadioIp = search.radioIp as string;
      console.log("passed in url, found radio ip = ", targetRadioIp);
    }
    return {
      localStation: station,
      mstBus: bus,
      appType: appType,
      radioIp: targetRadioIp,
      socket: socket,
      radioUuid: radioUuid,
      setRadioUuid: setRadioUuid,
      contactId: contactId,
      setContactId: setContactId,
    };
    // eslint-disable-next-line
  }, [station, bus, socket, appType]);

  const state = store.getState();
  if (state.auth.token || appType === "single") {
    ipcRenderer.send("maxSze");
  } else {
    ipcRenderer.send("minSze");
  }
  //

  //系统自检巡检日志同步到业务服务器

  useEffect(() => {
    if (getAppType() === "terminal" && !localUse) {
      exec(`sudo ntpdate ${bizServerAddress}`, (error, stdout, stderr) => {
        if (error) console.error("同步时钟失败", error);
        console.log("同步时钟结果:", stdout, stderr);
      });
    }
  }, []);

  useEffect(() => {
    const cmd: Command = {
      cmd: "rtGetRadioInfo",
      radioUuid: LOCAL_MACHINE_ID,
    };
    socket.send(cmd);
    console.log(11111111111, cmd);

  }, [appType]);

  return (
    <MstContext.Provider value={contextMemo}>
      <Layout className="mc-layout">
        {appType === "control" && (
          /** 控制端 */
          <McRouter showHeaderFooter={state.auth.token ? true : false} />
        )}
        {appType === "terminal" && (
          /** 终端侧 */
          <McRouterTerminal showHeaderFooter={state.auth.token ? true : false} />
        )}
        {appType === "single" && (
          /** 终端侧 */
          <McRouterSingle showHeaderFooter={true} />
        )}
      </Layout>
      {!station.uuid && <McConnectionConfigModal />}
    </MstContext.Provider>
  );
};

export default McApp;

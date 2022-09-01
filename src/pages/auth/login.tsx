import "./index.less";
import LoginCloseBtn from "images/login/login_close.png";
import React, { FC, useEffect, useState } from "react";
import { CloseSquareOutlined } from "@ant-design/icons";
import { ipcRenderer } from "electron";
import store from "store";
import McLoginBox from "components/mc-login-modules/login-box";
import useCmdSender from "socket/command-sender";
import useCmdAckHandler from "./useCmdAckHandler";
import { getAppType, LOCAL_MACHINE_ID as radioUuid, setControlRadio } from "misc/env";
import McConfigTerminalModal from "components/mc-config-terminal-modal";

//import versions
import versionControlCenter from "misc/version-control.json";
import versionTerminal from "misc/version-terminal.json";
import versionSingle from "misc/version-single.json";

const Login: FC = () => {
  const appType = getAppType();
  const version =
    appType === "control"
      ? versionControlCenter
      : appType === "terminal"
      ? versionTerminal
      : versionSingle;
  const state = store.getState();

  const [configFlag, setConfigFlag] = useState<boolean>(false);

  if (state.auth.token) {
    ipcRenderer.send("maxSze");
  } else {
    ipcRenderer.send("minSze");
  }

  const send = useCmdSender();
  const processCmdAck = (ackData: AckData) => {
    const cmd = ackData.cmd;
    switch (cmd) {
      case "rtGetRadioInfo-ack":
        if (ackData.rc === -1) {
          setConfigFlag(true);
        } else {
          setControlRadio(ackData.radioUuid, ackData.data?.ip);
          setConfigFlag(false);
        }
        break;
      default:
      //do nothing
    }
  };
  useCmdAckHandler(processCmdAck);
  useEffect(() => {
    if (appType === "terminal") {
      const cmd: Command = {
        cmd: "rtGetRadioInfo",
        radioUuid: radioUuid,
      };
      send(cmd);
    }
  }, [appType, send]);

  return (
    <div
      className={`mc-login ${appType === "terminal" && "mc-login-terminal"}`}
      style={{ textAlign: "center" }}
    >
      <div className="mc-login__title">
        <div className="mc-login-button-close">
          {appType === "control" ? (
            <CloseSquareOutlined className="mc-header__icon" onClick={() => window.close()} />
          ) : (
            <img
              className="mc-header__icon__img"
              src={LoginCloseBtn}
              alt="关闭"
              onClick={() => {
                window.close();
              }}
            />
          )}
        </div>
      </div>
      <McLoginBox
        redirect="/"
        onError={(code, msg) => {
          if (code === 403) {
            setConfigFlag(true);
          }
        }}
      />
      <div className="mc-login-version">
        <span>版本号: {version.versionNo}</span>
      </div>

      {configFlag && appType === "terminal" && <McConfigTerminalModal />}
    </div>
  );
};

export default Login;

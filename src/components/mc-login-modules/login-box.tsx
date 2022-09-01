import "./login-box.less";
import Loading from "components/mc-loading";
import McTooltip, { IChildFun } from "containers/mc-tooltip";
import React, { FC, useRef, useState } from "react";
import { useHistory } from "react-router";
import useAuth from "./useAuth";
import {
  LOCAL_MACHINE_ID,
  setContactId,
  setRadioUuid,
  loadConfig,
  saveConfig,
  getAppType,
} from "misc/env";
import fetch, { external } from "utils/fetch";
import { Switch } from "antd";
import useCmdSender from "socket/command-sender";
import { logInfo } from "../../misc/util";
import exec from "services/exec";

interface IProps {
  redirect?: string;
  onError: (errorCode: number, errorMsg: string) => void;
  onSuccess?: (successMsg: string) => void;
}

const savedCfg = loadConfig();

const McLoginBox: FC<IProps> = ({ redirect, onError, onSuccess }) => {
  const loginName = useRef<HTMLInputElement>();
  const loginPswd = useRef<HTMLInputElement>();
  const loginNameError = useRef<IChildFun>();
  const loginPswdError = useRef<IChildFun>();
  const loginHttpError = useRef<IChildFun>();
  const [localUse, setLocalUse] = useState<boolean>(savedCfg.localUse);
  const [errorData, setErrorData] = useState<string>("");
  const history = useHistory();
  const { auth, loading } = useAuth();
  const send = useCmdSender();

  const appType = getAppType();

  const doLogin = async (name: string, pswd: string) => {
    //如果是终端，并且是脱网使用，则登录前先更新本机uuid（初始化动作）
    if (appType === "terminal" && localUse) {
      await external.put(`/sysRadio/modify/${LOCAL_MACHINE_ID}`);
    }

    //判断数据合法性
    let error = "";
    const loginNm = name.trim();
    const loginPwd = pswd.trim();
    if (loginNm === "") {
      error = "用户名不能为空";
      setErrorData(error);
      loginNameError.current.updateTip();
      return;
    }
    if (loginPwd === "") {
      error = "密码不能为空";
      setErrorData(error);
      loginPswdError.current.updateTip();
      return;
    }

    const loginResult = await auth(name, pswd);

    if (loginResult.success) {
      onSuccess && onSuccess("登录成功。");

      setRadioUuid(LOCAL_MACHINE_ID);
      logInfo("登录成功。");
      const { data } = await fetch.get(`/sysRadio/get/${LOCAL_MACHINE_ID}`);
      setContactId(data.data?.contactId);

      // alert(parseInt(data.data.contactId));
      if (redirect) {
        history.push(redirect);
        window.location.reload();
      }
    } else {
      setErrorData(loginResult.message);
      loginNameError.current?.updateTip();
      onError && onError(loginResult.code, loginResult.message);
    }
  };
  return (
    <div className="mc-login-box">
      <div className="mc-login-box__margn">
        <div>
          <span className=" mc-login-box__lable ">用户名:</span>
        </div>
        <div className="mc_margn">
          <McTooltip title={errorData} onRef={loginNameError}>
            <input
              ref={loginName}
              autoFocus
              className="mc-login-box__input mc-login-box__img"
              onKeyUp={e => {
                e.preventDefault();
                if (e.key === "Enter" && e.currentTarget.value !== "") {
                  loginPswd.current?.focus();
                }
              }}
            />
          </McTooltip>
        </div>
        <div className="mc-login-box__lable">
          <span>密 码:</span>
        </div>
        <div className="mc_margn">
          <McTooltip title={errorData} onRef={loginPswdError}>
            <input
              ref={loginPswd}
              className="mc-login-box__input mc-login-box__pswd "
              type="password"
              onKeyUp={e => {
                if (e.key !== "Enter") return;
                doLogin(loginName.current.value, loginPswd.current.value);
              }}
            />
          </McTooltip>
        </div>
        <div>
          <McTooltip title={errorData} onRef={loginHttpError}>
            <button
              onClick={() => doLogin(loginName.current.value, loginPswd.current.value)}
              className="mc_margn_lage"
            >
              登&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;录
            </button>
          </McTooltip>
          {appType === "terminal" && (
            <div className="select-local">
              <Switch
                title={`当前为${localUse ? "脱网模式" : "联网模式"}，点击切换到${
                  !localUse ? "脱网模式" : "联网模式"
                }`}
                className={localUse ? "switch-local" : "switch-online"}
                checked={!localUse}
                onChange={checked => {
                  //checked === true: 联网模式 false: 脱网模式
                  setLocalUse(!checked);
                  //（尝试）通知总控服务器本机脱网/联网
                  const cmd: Command = {
                    cmd: "rtRadioOffLine",
                    radioUuid: LOCAL_MACHINE_ID,
                    data: {
                      mode: checked ? "off" : "on",
                    },
                  };
                  send(cmd);
                  //通知业务服务器清理
                  const morseCmd = "morse-setup -stopsox sox";
                  const _socket = exec(morseCmd, {
                    onReady: () => {
                      console.debug("通知业务服务器清理morse socket，已连接。。。");
                    },
                    onError: () => {
                      console.error("通知业务服务器清理morse socket，失败！！！！！！");
                    },
                    onClose: () => {
                      console.debug("通知业务服务器清理morse socket，已关闭！");
                    },
                  });
                  //保存连接配置
                  saveConfig({ ...savedCfg, localUse: !checked });
                  //关闭连接并释放资源
                  setTimeout(() => {
                    _socket.destroy();
                    _socket.end();
                    window.location.reload();
                  }, 500);
                }}
                checkedChildren="联网模式"
                unCheckedChildren="脱网模式"
              />
            </div>
          )}
        </div>
      </div>
      {loading && (
        <Loading
          position="absolute"
          left="45%"
          textAlign="center"
          paddingTop="0"
          paddingBottom="0"
          top="50%"
        >
          正在登录
        </Loading>
      )}
    </div>
  );
};

export default McLoginBox;

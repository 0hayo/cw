import os from "os";
import path from "path";
import fs from "fs";
import { machineIdSync } from "node-machine-id";

process.on("warning", e => console.warn(e.stack));

export const kPORT = 15800;
// export const kPORT = 19588;
// export const kPORT = 19516;
// export const kHOST = "172.16.30.218";
// export const kHOST = "127.0.0.1";
// export const kHOST = "192.168.8.104";

export const kWorkSpace = path.join(os.homedir(), ".morsed");
export const kWorkFiles = path.join(kWorkSpace, "files");

const getLocalNetInfo = () => {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
        return alias;
      }
    }
  }
};

const LOCAL_NET_INFO = getLocalNetInfo();

/** 本机MAC地址 */
// export const LOCAL_NET_MAC = LOCAL_NET_INFO ? LOCAL_NET_INFO.mac : "";
/** 本机IP地址 */
export const LOCAL_NET_IP = LOCAL_NET_INFO ? LOCAL_NET_INFO.address : "";
/** 本机唯一ID */
export const LOCAL_MACHINE_ID = machineIdSync(true);

//Get Working mode from ~/.morsed/config.json
const config = path.join(kWorkSpace, "config.json");
const exists = fs.existsSync(config);
const json = exists
  ? JSON.parse(fs.readFileSync(config).toString())
  : {
    workingMode: "dualmode",
    signalDetectionSnrThreshold: 2.0,
    signalDetectionAmplitudeThreshold: 50000.0,
  };
export const workingMode = json.workingMode;
export const signalDetectionSnrThreshold = json.signalDetectionSnrThreshold;
export const signalDetectionAmplitudeThreshold = json.signalDetectionAmplitudeThreshold;
export const defaultFrequency = 1000;

export const setAppType = (appType: AppType) => {
  localStorage.setItem("APP_TYPE", appType);
};

export const getAppType = (): AppType => {
  return (localStorage.getItem("APP_TYPE") as AppType) || "single";
};

const configClient = localStorage.getItem("SYS-CONFIG");
const existsClient = configClient ? true : false;
export var _1t6Config: _1T6Config = existsClient
  ? JSON.parse(configClient)
  : {
    ratioWarnThreshold: 70,
    maxWarnCount: 500,
    bizServerAddress: getAppType() === "single" ? "127.0.0.1" : "192.168.168.168",
    bizServerHttpPort: 8080,
    aiServerHttpPort: 8081,
    bizServerProtocol: "http",
    bizServerAPINamespace: "1t6",
    controlSocketPort: 16000,
    terminalSocketPort: 15000,
    audioSendSocketPort: 15522,
    audioRecvSocketPort: 15521,
    localUse: false, //脱网使用（连接本地服务）
  };

export const ratioWarnThreshold = _1t6Config.ratioWarnThreshold
  ? _1t6Config.ratioWarnThreshold
  : 70;
export const maxWarnCount = _1t6Config.maxWarnCount ? _1t6Config.maxWarnCount : 5;
/** 业务服务器地址 */
export const bizServerAddress = _1t6Config.localUse
  ? "localhost"
  : _1t6Config.bizServerAddress || "localhost";

/** 是否单机使用 */
export const localUse = _1t6Config.localUse ? true : false;
/** 业务服务器HTTP服务端口 */
export const bizServerHttpPort = _1t6Config.bizServerHttpPort ? _1t6Config.bizServerHttpPort : 8080;
/** 业务服务器HTTP服务端口 */
export const aiServerHttpPort = _1t6Config.aiServerHttpPort ? _1t6Config.aiServerHttpPort : 8081;
/** 业务服务器协议类型：http or https */
export const bizServerProtocol = _1t6Config.bizServerProtocol
  ? _1t6Config.bizServerProtocol
  : "http";
/** 业务服务器API路径，比如：1t6 */
export const bizServerAPINamespace = _1t6Config.bizServerAPINamespace
  ? _1t6Config.bizServerAPINamespace
  : "mst";
export const terminalSocketPort = _1t6Config.terminalSocketPort
  ? _1t6Config.terminalSocketPort
  : 15000;
export const controlSocketPort = _1t6Config.controlSocketPort
  ? _1t6Config.controlSocketPort
  : 16000;
export const audioSendSocketPort = _1t6Config.audioSendSocketPort
  ? _1t6Config.audioSendSocketPort
  : 15522;
export const audioRecvSocketPort = _1t6Config.audioRecvSocketPort
  ? _1t6Config.audioRecvSocketPort
  : 15521;

console.log(
  "业务服务器：",
  `${bizServerProtocol}://${bizServerAddress}:${bizServerHttpPort}/${bizServerAPINamespace}`
);

export const bizServerAPIPath = `${bizServerProtocol}://${bizServerAddress}:${bizServerHttpPort}/${bizServerAPINamespace}`;

export const saveConfig = (config: _1T6Config) => {
  _1t6Config = config;
  localStorage.setItem("SYS-CONFIG", JSON.stringify(config));
};

export const loadConfig = (): _1T6Config => {
  const savedCfg = localStorage.getItem("SYS-CONFIG");
  if (savedCfg) {
    const cfg: _1T6Config = JSON.parse(savedCfg);
    return cfg;
  } else {
    return _1t6Config;
  }
};

/**
 * 设置当前正在控制的电台(终端)信息
 * @param radioUuid 电台UUID
 * @param ip 电台IP地址
 */
export const setControlRadio = (radioUuid: string, ip: string) => {
  localStorage.setItem("CONTROL_RADIO", JSON.stringify({ radioUuid, ip }));
};

/**
 * 获取当前正在控制的电台（终端）信息
 * @returns {radioUuid: string, ip: string}, 默认为： {radioUuid: "10001", ip: "localhost"}
 */
export const getControlRadio = (): { radioUuid: string; ip: string } => {
  const content = localStorage.getItem("CONTROL_RADIO");
  if (content) {
    return JSON.parse(content);
  } else {
    return { radioUuid: LOCAL_MACHINE_ID, ip: "127.0.0.1" };
  }
};

export const setRadioUuid = (radioUuid: string) => {
  localStorage.setItem("radioUuid", radioUuid);
};

export const getRadioUuid = (): string => {
  return (localStorage.getItem("radioUuid") as string) || "";
};

export const setContactId = (contactId: string) => {
  localStorage.setItem("contactId", contactId);
};

export const getContactId = (): string => {
  return (localStorage.getItem("contactId") as string) || "";
};

export const setTaskLabelCompleted = (completed: string) => {
  localStorage.setItem("completed", completed);
};

export const getTaskLabelCompleted = (): string => {
  return (localStorage.getItem("completed") as string) || "1";
};

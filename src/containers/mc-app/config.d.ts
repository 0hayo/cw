interface _1T6Config {
  ratioWarnThreshold: number;
  maxWarnCount: number;
  bizServerAddress: string;
  bizServerHttpPort: number;
  aiServerHttpPort: number;
  bizServerProtocol: "http" | "https";
  bizServerAPINamespace: string;
  controlSocketPort: number;
  terminalSocketPort: number;
  audioSendSocketPort: number;
  audioRecvSocketPort: number;
  localUse: boolean;
}

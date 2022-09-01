/** 业务服务器应答指令数据结构 */
interface AckData {
  /** 电台UUID */
  radioUuid: string;
  /** 返回值，小于0表示失败，否则表示成功 */
  rc?: number;
  /** 相应的命令代号 */
  cmd: string;
  /** 消息 */
  message?: string;
  /** 发生时间（timestamp） */
  timestamp?: number;
  /** 应答数据 */
  data?: any;
}

/** 操控电台指令 */
interface Command {
  /** 相应的命令代号 */
  cmd: string;
  /** 电台UUID */
  // transceiverUuid?: string;
  radioUuid?: string;
  /** 发送数据 */
  data?: any;
}

/**
 * 定义对业务服务器应答指令(Ack)进行处理的系列方法
 */
interface MstCmdAckHandler {
  //----------------------------终端信息/状态----------------------------------
  /** 获取终端信息*/
  on(name: "rtGetRadioInfo", callback: (data: AckData) => void): void;
  on(name: "rtGetRadioInfo-ack", callback: (data: AckData) => void): void;
  /** 终端启动（通知服务器） */
  on(name: "ctRadioStart", callback: (data: AckData) => void): void;
  /** 终端启动（通知总控端） */
  on(name: "ctRadioStart-ack", callback: (data: AckData) => void): void;
  /** 终端登录(通知总控端) */
  on(name: "ctRadioLogin-ack", callback: (data: AckData) => void): void;
  /** 终端注销(通知总控端) */
  on(name: "ctRadioLogout-ack", callback: (data: AckData) => void): void;
  /** 终端关闭(通知总控端) */
  on(name: "ctRadioClose-ack", callback: (data: AckData) => void): void;

  //----------------------------终端作业状态----------------------------------
  /** 终端开始发报(通知服务器) */
  on(name: "rtSendTelegram", callback: (data: AckData) => void): void;
  on(name: "rtSendTelegram-ack", callback: (data: AckData) => void): void;
  /** 终端开始发报(通知总控端) */
  on(name: "ctSendTelegram-ack", callback: (data: AckData) => void): void;

  /** 终端完成发报(通知服务器) */
  on(name: "rtSendTelegramComplete", callback: (data: AckData) => void): void;
  on(name: "rtSendTelegramComplete-ack", callback: (data: AckData) => void): void;
  /** 终端完成发报(通知总控端) */
  on(name: "ctSendTelegramComplete-ack", callback: (data: AckData) => void): void;

  /** 终端开始收报(通知服务器) */
  on(name: "rtReceiveTelegram", callback: (data: AckData) => void): void;
  on(name: "rtReceiveTelegram-ack", callback: (data: AckData) => void): void;
  /** 终端开始收报(通知总控端) */
  on(name: "ctReceiveTelegram-ack", callback: (data: AckData) => void): void;

  /** 终端完成收报(通知服务器) */
  on(name: "rtReceiveTelegramComplete", callback: (data: AckData) => void): void;
  on(name: "rtReceiveTelegramComplete-ack", callback: (data: AckData) => void): void;
  /** 终端完成收报(通知总控端) */
  on(name: "ctReceiveTelegramComplete-ack", callback: (data: AckData) => void): void;

  //----------------------------终端注册----------------------------------
  /** 终端注册 */
  on(name: "rtRadioRegist", callback: (data: AckData) => void): void;
  on(name: "rtRadioRegist-ack", callback: (data: AckData) => void): void;

  on(name: "ctRadioRegist-ack", callback: (data: AckData) => void): void;

  //---------------------------控制设备-----------------------------
  /** 控制（接管）设备 */
  on(name: "ctControlRadio", callback: (data: AckData) => void): void;
  on(name: "ctControlRadio-ack", callback: (data: AckData) => void): void;
  /** 通知终端已被接管 */
  on(name: "rtControlRadio-ack", callback: (data: AckData) => void): void;
  /** 释放设备 */
  on(name: "ctReleaseRadio", callback: (data: AckData) => void): void;
  on(name: "ctReleaseRadio-ack", callback: (data: AckData) => void): void;
  /** 通知终端已被释放 */
  on(name: "rtReleaseRadio-ack", callback: (data: AckData) => void): void;

  //---------------------------心跳检测（终端在线状态自举）--------------------------------
  /** 定时检查连接 */
  on(name: "rtCheckLink", callback: (data: AckData) => void): void;
  on(name: "rtCheckLink-ack", callback: (data: AckData) => void): void;
  //---------------------------定时推送任务（终端在线状态自举）--------------------------------
  /** 定时推送任务提醒 */
  on(name: "ctRemindTask-ack", callback: (data: AckData) => void): void;
  on(name: "rtRemindTask-ack", callback: (data: AckData) => void): void;
  /** 终端首页待机指令 */
  on(name: "rtRadioStandby", callback: (data: AckData) => void): void;
  on(name: "rtRadioStandby-ack", callback: (data: AckData) => void): void;
}

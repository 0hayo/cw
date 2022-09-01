import useGuid from "hooks/useGuid";
import useCommandHandler from "socket/ack-command-handler";

const useCmdAckHandler = (processCmdAck: (ackData: AckData) => void) => {
  const uuid = useGuid();

  // const cmdAckHandler = useCallback((cmdAckCallback: MstCmdAckHandler) => {
  const cmdAckHandler = (cmdAckCallback: MstCmdAckHandler) => {
    /** 通知总控端有新设备注册 */
    cmdAckCallback.on("ctRadioRegist-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
    /**5.启动终端 通知总控端 */
    cmdAckCallback.on("ctRadioStart-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
    /**终端登录 通知终端 */
    cmdAckCallback.on("ctRadioLogin-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
    cmdAckCallback.on("ctRadioLogout-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
    /**通知总控端设备已离线 */
    cmdAckCallback.on("ctRadioClose-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
    /**正在收报 通知总控端 */
    cmdAckCallback.on("ctReceiveTelegram-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
    /**正在收报 完成 通知总控端 */
    cmdAckCallback.on("ctReceiveTelegramComplete-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
    /**正在发报 通知总控端 */
    cmdAckCallback.on("ctSendTelegram-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
    /**正在发报 完成 通知总控端 */
    cmdAckCallback.on("ctSendTelegramComplete-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });

    /**定时推送任务 通知总控端 */
    cmdAckCallback.on("ctRemindTask-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
    /**通知终端已被接管 通知总控端 */
    cmdAckCallback.on("ctControlRadio-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
    /**通知终端已被释放 通知总控端 */
    cmdAckCallback.on("ctReleaseRadio-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
  };
  useCommandHandler("mc-header-" + uuid, cmdAckHandler);
};

export default useCmdAckHandler;

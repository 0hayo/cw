import useGuid from "hooks/useGuid";
import useCommandHandler from "socket/ack-command-handler";

const useCmdAckHandler = (processCmdAck: (ackData: AckData) => void) => {
  const uuid = useGuid();
  // const cmdAckHandler = useCallback((cmdAckCallback: MstCmdAckHandler) => {
  const cmdAckHandler = (cmdAckCallback: MstCmdAckHandler) => {
    /**接管设备 通知终端 */
    cmdAckCallback.on("rtControlRadio-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
    /**释放设备 通知终端 */
    cmdAckCallback.on("rtReleaseRadio-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });

    /**定时推送任务 终端 */
    cmdAckCallback.on("rtRemindTask-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });

    /**定时检查连接 终端 */
    cmdAckCallback.on("rtCheckLink-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
  };
  useCommandHandler("mc-sidebar-" + uuid, cmdAckHandler);
};

export default useCmdAckHandler;

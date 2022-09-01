import useGuid from "hooks/useGuid";
import useCommandHandler from "socket/ack-command-handler";

const useCmdAckHandler = (processCmdAck: (ackData: AckData) => void) => {
  const uuid = useGuid();
  // const cmdAckHandler = useCallback((cmdAckCallback: MstCmdAckHandler) => {
  const cmdAckHandler = (cmdAckCallback: MstCmdAckHandler) => {
    /** 终端登录 */
    cmdAckCallback.on("rtRadioStandby-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
    // cmdAckCallback.on("rtSendTelegramComplete-ack", async (ackData: AckData) => {
    //   processCmdAck(ackData);
    // });
    // cmdAckCallback.on("rtCheckLink-ack", async (ackData: AckData) => {
    //   processCmdAck(ackData);
    // });
  };
  useCommandHandler("pages-tx-ready-" + uuid, cmdAckHandler);
};

export default useCmdAckHandler;

import useGuid from "hooks/useGuid";
import useCommandHandler from "socket/ack-command-handler";

const useCmdAckHandler = (processCmdAck: (ackData: AckData) => void) => {
  const uuid = useGuid();
  // const cmdAckHandler = useCallback((cmdAckCallback: MstCmdAckHandler) => {
  const cmdAckHandler = (cmdAckCallback: MstCmdAckHandler) => {
    /** 终端登录 */
    cmdAckCallback.on("rtGetRadioInfo-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
  };
  useCommandHandler("pages-auth-" + uuid, cmdAckHandler);
};

export default useCmdAckHandler;

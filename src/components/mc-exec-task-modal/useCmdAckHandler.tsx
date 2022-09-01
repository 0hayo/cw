import useGuid from "hooks/useGuid";
import useCommandHandler from "socket/ack-command-handler";

const useCmdAckHandler = (processCmdAck: (ackData: AckData) => void) => {
  const uuid = useGuid();

  // const cmdAckHandler = useCallback((cmdAckCallback: MstCmdAckHandler) => {
  const cmdAckHandler = (cmdAckCallback: MstCmdAckHandler) => {
    /**通知终端已被接管 通知总控端 */
    cmdAckCallback.on("ctControlRadio-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
  };
  useCommandHandler("mc-exec-task-modal-" + uuid, cmdAckHandler);
};

export default useCmdAckHandler;

import useGuid from "hooks/useGuid";
import useCommandHandler from "socket/ack-command-handler";

const useCmdAckHandler = (processCmdAck: (ackData: AckData) => void) => {
  const uuid = useGuid();

  // const cmdAckHandler = useCallback((cmdAckCallback: MstCmdAckHandler) => {
  const cmdAckHandler = (cmdAckCallback: MstCmdAckHandler) => {
    //终端注册 ack
    cmdAckCallback.on("rtRadioRegist-ack", async (ackData: AckData) => {
      processCmdAck(ackData);
    });
  };

  useCommandHandler("mc-config-terminal-modal-" + uuid, cmdAckHandler);
};

export default useCmdAckHandler;

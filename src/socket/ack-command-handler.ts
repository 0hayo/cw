import MstContext from "containers/mst-context/context";
import useCmdAck from "hooks/useCmdAck";
import { useContext, useEffect } from "react";

const useCommandHandler = (
  uuid: string,
  cmdAckHandler: (cmdAckCallback: MstCmdAckHandler) => void
) => {
  const { socket, mstBus } = useContext(MstContext);
  const cmdAck = useCmdAck({ bus: mstBus, uuid });
  cmdAckHandler(cmdAck);

  useEffect(() => {
    /** 重载 socket reader  */
    socket && socket.register(uuid);
    //组件unMount的时候，关闭reader ！！！
    return () => socket?.unregister(uuid);
  }, [mstBus, socket, uuid]);
};

export default useCommandHandler;

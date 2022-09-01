import MstContext from "containers/mst-context/context";
import { useContext } from "react";
import { useCallback } from "react";

const useCmdSender = (): ((cmd: Command) => void) => {
  const { socket } = useContext(MstContext);
  // const [ thisSocket, setThisSocket ] = useState(socket);
  const send = useCallback(
    async (cmd: Command) => {
      socket.send(cmd);
    },
    [socket]
  );
  return send;
};

export default useCmdSender;

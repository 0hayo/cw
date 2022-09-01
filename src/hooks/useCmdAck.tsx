import { Bus } from "misc/bus";
import { useEffect, useState } from "react";

interface IProps {
  bus: Bus;
  uuid: string;
}

export const make = ({ bus, uuid }: IProps): MstCmdAckHandler => {
  return {
    on: (name: string, func: (...args: any) => void) => {
      bus && bus.on(`mst-${uuid}:${name}`, func);
      // bus.dump();
    },
  };
};

const useCmdAck = (deps: IProps): MstCmdAckHandler => {
  const [cmdAck] = useState(make(deps));

  useEffect(() => {
    //组件卸载的时候，销毁已注册的event代理
    return () => {
      deps.bus?.remove(`mst-${deps.uuid}:`);
    };
  }, [deps.bus, deps.uuid]);

  return cmdAck;
};

export default useCmdAck;

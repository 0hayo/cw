import { Bus } from "misc/bus";
import { useState } from "react";
import { MceInstance } from "mce/typing";

interface IProps {
  bus: Bus;
  uuid: string;
}

const make = ({ bus, uuid }: IProps): MceInstance => ({
  on: (name: string, func: (...args: any) => void) => {
    bus.on(`mc-${uuid}:${name}`, func);
  },
});

const useMci = (deps: IProps): MceInstance => {
  const [mci] = useState(make(deps));
  return mci;
};

export default useMci;

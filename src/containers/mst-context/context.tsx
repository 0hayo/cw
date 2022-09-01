import { createContext } from "react";
import { Bus } from "misc/bus";

interface MstContextProps {
  /** 当前台站 */
  localStation: MstLocalStation;
  mstBus: Bus;
  appType: AppType; //应用程序类型：终端、总控端、单机版
  radioIp: string;
  socket: MstSocket;
  radioUuid?: string;
  setRadioUuid?: (radioUuid: string) => void;
  contactId?: number;
  setContactId?: (contactId: number) => void;
}

const MstContext = createContext<MstContextProps>({
  localStation: {
    uuid: "",
    name: "",
    code: "",
    logo: "",
  },
  mstBus: null,
  socket: null,
  appType: "single",
  radioIp: "0.0.0.0",
  radioUuid: "0000",
  setRadioUuid: (radioUuid: string) => {
    console.log("SET RADIO UUID TO:", radioUuid);
  },
  contactId: 0,
  setContactId: (contactId: number) => {
    console.log("SET CONTACTID TO:", contactId);
  },
});

export default MstContext;

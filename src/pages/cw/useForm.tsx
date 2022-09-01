import IForm from "./form";
import { Dispatch, SetStateAction } from "react";
import useState, { Setter } from "hooks/useState";

const useForm = (): [IForm, Dispatch<SetStateAction<IForm>>, Setter<keyof IForm>] => {
  const [zone, setZone, setZoneProp] = useState<IForm>({
    // localStation: {
    //   uuid: "",
    //   name: "--",
    //   code: "",
    //   logo: "",
    // },
    activeRadio: null,
    contactStation: null,
    // radios: [],
    // records: [],
    // statistics: [],
    datagramType: "CWS",
    cwReady: false,
    cwTitle: "自动模式",
    cwDevice: "对方为设备",
  });
  return [zone, setZone, setZoneProp];
};

export default useForm;

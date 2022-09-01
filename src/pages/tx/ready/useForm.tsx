import { IForm, DUMB_FEED } from "./typing";
import { Dispatch, SetStateAction } from "react";
import useState, { Setter } from "hooks/useState";
import moment from "moment";

const useForm = (): [IForm, Dispatch<SetStateAction<IForm>>, Setter<keyof IForm>] => {
  const [form, setForm, setProp] = useState<IForm>({
    page: 1,
    size: 1,
    type: "CW",
    role: "head",
    name: "",
    sdate: "",
    pdate: "",
    date: new Date().toISOString(),
    head: {},
    body: {},
    code: "",
    feed: DUMB_FEED,
    feedRx: DUMB_FEED,
    hint: [],
    speed: 120,
    soundFlag: false,
    progress: 0,
    transmit: true,
    finish: false,
    messages: [],
    check: {
      head: {},
      body: {},
      offset: 0,
      page: 1,
      size: 1,
      active: -1,
    },
    ui: {
      save: false,
      exit: false,
      prepare: false,
      autoPage: true,
      send: false,
      print: false,
    },
    send: {
      role: "body",
      dx: -1,
      dy: -1,
      repeat: false,
      continuous: false,
      whole: false,
      page: 0,
    },
    phystatus: false,
    autoFlag: 1,
    sendStatus: false,
    sendNumber: 0,
    qsyShow: false,
    startTime: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    endTime: "",
    telegramCode: "",
    otherCode: "",
    ownCode: "",
    telegramCodeOther: "",
    otherCodeOther: "",
    ownCodeOther: "",
    workNumber: "",
    telegramLevel: " ",
  });

  return [form, setForm, setProp];
};

export default useForm;

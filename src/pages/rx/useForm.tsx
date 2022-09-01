import path from "path";
import { IForm, DUMB_FEED } from "./typing";
import useGuid from "hooks/useGuid";
import { MceFlag } from "mce/typing";
import { kWorkFiles } from "misc/env";
import { useState, Dispatch, SetStateAction } from "react";

const useForm = (): [IForm, Dispatch<SetStateAction<IForm>>] => {
  const guid = useGuid();
  const [zone, setZone] = useState<IForm>({
    dir: path.join(kWorkFiles, "recv", guid),
    type: "CCK",
    role: "body",
    name: "",
    date: new Date().toISOString(),
    code: "",
    feed: DUMB_FEED,
    feedRx: DUMB_FEED,
    sendString: "",
    hint: [],
    head: {},
    body: {},
    page: 1,
    size: 1,
    flag: MceFlag.State,
    offset: 0,
    progress: 0,
    transmit: false,
    state: "none",
    scene: "",
    autoFlag: 1,
    sendStatus: false,
    sendNumber: 0,
    pictures: [],
    messages: [],
    a: {
      page: 1,
      size: 1,
      head: {},
      body: {},
    },
    b: {
      page: 1,
      size: 1,
      head: {},
      body: {},
    },
    ab: "a",
    regular: {
      head: {},
      body: {},
      role: "head",
      page: 1,
      size: 1,
      offset: -1,
    },
    speed: 120,
    soundFlag: false,
    ui: {
      chat: true,
      code: false,
      save: false,
      print: false,
      warn: true,
      loading: false,
    },
    phystatus: false,
    active: -1,
    receive: true,
    leave: false,
    taskid: "",
    qsyShow: false,
    errorShow: false,
    startTime: "",
    endTime: "",
    workNumber: "",
    saved: false,
  });

  return [zone, setZone];
};

export default useForm;

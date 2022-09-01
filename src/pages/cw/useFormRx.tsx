import path from "path";
import { IForm, DUMB_FEED } from "pages/rx/typing";
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
    autoFlag: 0,
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
    speed: 80,
    ui: {
      chat: true,
      code: false,
      save: false,
      print: false,
      warn: false,
      loading: false,
    },
    phystatus: false,
    active: -1,
    receive: true,
    leave: false,
    workNumber: "",
    saved: false,
  });

  return [zone, setZone];
};

export default useForm;

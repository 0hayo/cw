import { Socket } from "net";
import qs from "query-string";
import { IForm } from "./typing";
import xcode from "services/xcode";
import xsession from "services/xsession";
import useMounted from "hooks/useMounted";
import { max } from "misc/telegram";
import { useLocation } from "react-router";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react";
import xmeta from "services/xmeta";

const useInit = (setForm: Dispatch<SetStateAction<IForm>>, uuid?: string) => {
  const socket = useRef<Socket>();
  const mounted = useMounted();
  const location = useLocation();
  // console.log("location.search", location.search);
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const dir = uuid ? uuid : (search.dir as string);
  // const taskUuid = search.taskUuid != null ? search.taskUuid : null;

  // const contactId = search.contactId as string;
  // alert(contactId);
  // setForm( x=>({
  //   ...x,
  //   contactTableId: parseInt(contactId + ""),
  // }));

  useEffect(() => {
    (async () => {
      // if (!taskUuid && dir) {
      //   const param = {
      //     datagrams: [
      //       {
      //         title: "临时任务",
      //         type: "1",
      //         uuid: dir,
      //       },
      //     ],
      //     // name: dir,
      //     name: "发送任务" + moment(Date.now()).format("YYYY年MM月DD日"),
      //     type: "1",
      //     startTime: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") + "",
      //   };
      //   const { data } = await fetch.post<ManageResponse>("/sysTask/insert", JSON.stringify(param));
      //   if (!data.data) {
      //     return;
      //   }
      //   setForm(x => ({
      //     ...x,
      //     taskid: data.data?.id + "",
      //   }));
      // }

      if (dir) {
        const meta = (await xmeta.readServer(dir)) as McTelegramMeta;
        const codeAll = await xcode.readServer(dir, dir);
        console.log("codeAll===", codeAll);
        const code = codeAll ? (codeAll["code"] as McTelegram) : null;

        const session = await xsession.readServer(dir);
        console.log("session....", session);
        if (codeAll) {
          // alert("session" + session);
          const size = Math.ceil(max(code.body) + 1);
          setForm(form => ({
            ...form,
            ...code,
            dir,
            session,
            type: meta?.type,
            name: meta?.name,
            pdate: meta?.ptime,
            size: size,
            finish: meta?.finish ? true : false,
            check: {
              ...form.check,
              head: { ...code.head },
              body: { ...code.body },
              size: size,
            },
          }));
        }
      }
    })();
    //eslint-disable-next-line
  }, [dir, setForm, mounted]);

  useEffect(() => {
    const _socket = socket.current;
    return () => {
      _socket && _socket.end();
    };
  }, []);
};

export default useInit;

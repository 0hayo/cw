import { Socket } from "net";
import qs from "query-string";
import { DUMB_FEED, IForm } from "./typing";
import xmeta from "services/xmeta";
import xcode from "services/xcode";
import xcopy from "services/xcopy";
import xregular from "services/xregular";
import xsession from "services/xsession";
import message from "misc/message";
import { max, empty } from "misc/telegram";
import { useLocation } from "react-router";
import { useMemo, useEffect, Dispatch, SetStateAction, useRef } from "react";
import useWarn from "./useWarn";
import { cloneDeep } from "lodash";
import useMounted from "hooks/useMounted";

const useInit = (setForm: Dispatch<SetStateAction<IForm>>) => {
  const ref = useRef<Socket>();
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const markWarn = useWarn(setForm);
  const dir = search.dir as string;
  // const scene: "ready" | "copy" | "check" | "regular" | "" =
  //   search.scene === "check"
  //     ? "check"
  //     : search.scene === "copy"
  //     ? "copy"
  //     : search.scene === "ready"
  //     ? "ready"
  //     : search.scene === "regular"
  //     ? "regular"
  //     : "";
  // const scene: "ready" | "copy" | "check" | "regular" | "" = "ready";
  const scene: "ready" | "copy" | "check" | "regular" | "" =
    search.scene === "regular" ? "regular" : "ready";

  const taskid = search.taskUuid as string;
  const type = search.type as TelegramBizType;
  const mounted = useMounted();

  useEffect(() => {
    const messageStr = search.messages as string;
    const feedStr = search.feed as string;
    const messages: Message[] = messageStr && messageStr !== "" ? JSON.parse(messageStr) : [];
    const feed: Message = feedStr && feedStr !== "" ? JSON.parse(feedStr) : DUMB_FEED;
    const print: boolean = search.print === "true" ? true : false;
    if (taskid) {
      setForm(x => ({
        ...x,
        taskid: taskid,
      }));
    }
    if (type) {
      setForm(x => ({
        ...x,
        type: type,
      }));
    }
    //同步设置UI所需的form states
    mounted.current &&
      setForm(form => {
        return {
          ...form,
          taskid: taskid,
          type: type,
          scene: scene,
          messages: messages,
          feed: feed,
          ui: {
            ...form.ui,
            print: print,
          },
        };
      });

    //异步加载session
    (async () => {
      try {
        if (dir) {
          // const code = await xcode.read(dir);
          const codeAll = await xcode.readServer(dir, dir);
          const code = codeAll["code"] as McTelegram;
          console.log("code", code);
          // const meta = await xmeta.read(dir);
          // const copy = await xcopy.read(dir);
          // const _regular = await xregular.read(dir);
          // const session = await xsession.read(dir);
          const meta = await xmeta.readServer(dir);
          const copy = await xcopy.readServer(dir);
          const _regular = await xregular.readServer(dir);
          const session = await xsession.readServer(dir);
          markWarn(code.head, code.body);

          mounted.current &&
            setForm(it => ({
              ...it,
              dir,
              session,
              head: code.head,
              body: code.body,
              size: max(code.body),
              type: meta.type,
              name: meta.name,
              date: meta.stime,
              state: meta.state || "none",
              feed: feed,
              a: {
                ...it.a,
                head: copy ? copy.a.head : {},
                body: copy ? copy.a.body : {},
                size: copy ? Math.max(Math.ceil(max(copy.a.body) + 1), 1) : 1,
              },
              b: {
                ...it.b,
                head: copy ? copy.b.head : {},
                body: copy ? copy.b.body : {},
                size: copy ? Math.max(Math.ceil(max(copy.b.body) + 1), 1) : 1,
              },
              regular: {
                head:
                  _regular?.head && !empty(_regular?.head) ? _regular.head : cloneDeep(code.head),
                body:
                  _regular?.body && !empty(_regular?.body) ? _regular.body : cloneDeep(code.body),
                page: 1,
                size: _regular?.body && !empty(_regular.body) ? max(_regular.body) : max(code.body),
                offset: -1,
                role: "head",
              },
              scene: scene,
              ui: {
                ...it.ui,
                print: print,
                warn: true,
              },
            }));

          // if (session) {
          //   if (session.exists) {
          //     message.success("收报模块", "已沟通记录。");
          //   } else {
          //     message.warning("收报模块", "沟通记录未加载。");
          //   }
          // }
        }
      } catch (ex) {
        message.failure("系统错误", ex.message || ex.toString());
      }
    })();
  }, [
    setForm,
    markWarn,
    mounted,
    scene,
    taskid,
    type,
    dir,
    search.feed,
    search.messages,
    search.print,
  ]);

  useEffect(() => {
    const socket = ref.current;
    return () => {
      socket && socket.end();
    };
  }, []);
};

export default useInit;

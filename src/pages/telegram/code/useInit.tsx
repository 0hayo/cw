import qs from "query-string";
import { IForm } from "./typing";
import xcode from "services/xcode";
import message from "misc/message";
import { max } from "misc/telegram";
import { useLocation } from "react-router";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import xmeta from "services/xmeta";
import useMounted from "hooks/useMounted";
import moment from "moment";

const useInit = (setForm: Dispatch<SetStateAction<IForm>>) => {
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const from = search.from as string;
  const type = search.type as TelegramBizType;
  const mounted = useMounted();

  useEffect(() => {
    setForm(x => ({
      ...x,
      type,
      head: { ...x.head, DATE: { value: moment().format("MMDD") } },
      body: {},
      saved: true,
    }));
  }, [type, setForm]);

  useEffect(() => {
    if (from && mounted.current) {
      (async () => {
        try {
          const meta = await xmeta.readServer(from);
          const codeAll = await xcode.readServer(from, from);
          const code = codeAll["code"] as McTelegram;
          console.log("code===============", code);
          setForm(it => ({
            ...it,
            name: meta.name,
            head: code.head,
            body: code.body,
            dir: from,
            type: meta.type,
            size: Math.ceil(max(code.body) + 1),
            saved: true,
          }));
          return;
        } catch (ex) {
          message.failure("发生错误", ex.message || ex.toString());
        }
      })();
    }
  }, [from, mounted, setForm]);
};

export default useInit;

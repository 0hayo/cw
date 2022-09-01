import service from "./service";
import { IForm } from "./typing";
import validate from "./validate";
import message from "misc/message";

import { useState, Dispatch, useCallback, SetStateAction, useMemo } from "react";
import { useHistory, useLocation } from "react-router";
import qs from "_query-string@6.14.1@query-string";

const useSave = (
  setForm: Dispatch<SetStateAction<IForm>>
): [(form: IForm, goTx: boolean) => void, boolean] => {
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const retpath = search.retpath ? search.retpath : "";
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const callback = useCallback(
    async (form: IForm, goTx: boolean) => {
      setLoading(true);
      const error = validate(form);
      if (error) {
        setLoading(false);
        message.failure(error);
        return;
      }

      try {
        const dir = await service.saveServer({
          dir: form.dir,
          type: form.type,
          head: form.head,
          body: form.body,
          name: form.name,
          ptime: form.date,
          stime: new Date().toISOString(),
        });

        message.success("报文保存成功");

        setForm(it => ({
          ...it,
          dir,
          modal: false,
          saved: true,
        }));
        if (goTx) {
          history.push(`/cw?dir=${dir}&mode=tx`);
        } else if (retpath === "draft") {
          history.push("/files/draft");
        } else {
          window.history.back();
          // history.push("/");
        }
      } catch (ex) {
        message.failure("发生错误", ex.message || ex.toString());
      } finally {
        setLoading(false);
      }
    },
    [history, setForm, retpath]
  );

  return [callback, loading];
};

export default useSave;

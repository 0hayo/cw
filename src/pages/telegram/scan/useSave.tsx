import service from "./service";
import { IForm } from "./typing";
import validate from "./validate";
import message from "misc/message";
import { useState, Dispatch, useCallback, SetStateAction } from "react";
import { useHistory } from "react-router";

const useSave = (
  setForm: Dispatch<SetStateAction<IForm>>
): [(form: IForm, goTx: boolean) => void, boolean] => {
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const save = useCallback(
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
          telegramUuid: form.telegramUuid,
          dir: form.dir,
          type: form.type,
          head: form.head,
          body: form.body,
          name: form.name,
          ptime: form.date,
          stime: new Date().toISOString(),
          imgdir: form.imgdir,
          sysFilesId: form.sysFilesId,
          mode: form.mode,
        });

        message.success("报文保存成功");

        setForm(it => ({
          ...it,
          telegramUuid: dir,
          dir,
          modal: false,
          saved: true,
        }));

        if (goTx) {
          history.push(`/cw?dir=${dir}&mode=tx`);
        }
      } catch (ex) {
        message.failure("发生错误", ex.message || ex.toString());
      } finally {
        setLoading(false);
      }
    },
    [history, setForm]
  );

  return [save, loading];
};

export default useSave;

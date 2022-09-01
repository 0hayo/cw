import service from "./service";
import { IForm } from "./typing";
import validate from "./validate";
import message from "misc/message";
// import { useHistory } from "react-router";
import { useState, Dispatch, useCallback, SetStateAction } from "react";

const useSend = (setForm: Dispatch<SetStateAction<IForm>>): [(form: IForm) => void, boolean] => {
  // const history = useHistory();
  const [loading, setLoading] = useState(false);
  const callback = useCallback(
    async (form: IForm) => {
      setLoading(true);

      const error = validate(form);
      if (error) {
        setLoading(false);
        message.failure(error);
        return;
      }

      try {
        // const dir = await service.save({
        const dir = await service.saveServer({
          dir: form.dir,
          type: form.type,
          head: form.head,
          body: form.body,
          name: form.name,
          ptime: form.date,
          stime: new Date().toISOString(),
        });

        setForm(it => ({
          ...it,
          dir,
          modal: false,
          modalTd: true,
          saved: true,
        }));
        // alert("dir=" + dir);
        // history.push(`/tx/ready?dir=${encodeURIComponent(dir)}`);
      } catch (ex) {
        message.failure("发生错误", ex.message || ex.toString());
      } finally {
        setLoading(false);
      }
    },
    [setForm]
  );

  return [callback, loading];
};

export default useSend;

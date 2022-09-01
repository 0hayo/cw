// import path from "path";
import { IForm } from "./typing";
import message from "misc/message";
// import xcode from "services/xcode";
// import xmeta from "services/xmeta";
import { useCallback, Dispatch, SetStateAction } from "react";
// import fse from "misc/fse";
// import { kWorkFiles } from "misc/env";
import { useHistory } from "react-router";
// import { cloneDeep } from "lodash";
import { each } from "misc/telegram";
import xcode from "../../services/xcode";

const useForward = (setForm: Dispatch<SetStateAction<IForm>>): ((form: IForm) => void) => {
  const history = useHistory();
  const handler = useCallback(
    async (form: IForm) => {
      try {
        //创建draft目录
        // const dir = path.join(kWorkFiles, "draft", guid());
        // await fse.ensure(dir);
        // const dir = guid();
        // const dir = form.dir;
        // alert(form.dir);
        const dir =
          form.dir.indexOf("files") > 0
            ? form.dir.substring(form.dir.lastIndexOf("files") + 11)
            : form.dir;
        // const now = new Date().toISOString();
        const codeAll = await xcode.readServer(dir, dir);
        const code = codeAll["code"] as McTelegram;

        // const head = cloneDeep(form.regular.head);
        // const body = cloneDeep(form.regular.body);
        //
        // const head = cloneDeep(code.head);
        // const body = cloneDeep(code.body);
        const head = code.head;
        const body = code.body;
        each(head, (k, v) => {
          v.crude = v.value;
        });
        each(body, (k, v) => {
          v.crude = v.value;
        });
        // await xcode.save(dir, {
        //   head: head,
        //   body: body,
        // });

        // await xcode.saveServer(dir, {
        //   head: head,
        //   body: body,
        // });

        //meta
        // await xmeta.save(dir, {
        //   from: "recv",
        //   type: form.type,
        //   name: "转发:" + form.name,
        //   state: "none",
        //   stime: now,
        // });

        // await xmeta.saveServer(dir, {
        //   from: "recv",
        //   type: form.type,
        //   name: "转发:" + form.name,
        //   state: "none",
        //   stime: now,
        // });

        setForm(x => ({
          ...x,
          head: head,
          body: body,
          leave: true,
        }));

        // history.push(`/tx/ready?dir=${encodeURIComponent(dir)}`);
        // history.push(`/cw?dir=${encodeURIComponent(dir)}`);
        // alert(dir);
        history.push(`/cw?mode=tx&datagramType=TELS&type=${form.type}&dir=${dir}`);
      } catch (ex) {
        message.failure("发生错误", ex.message || ex.toString());
      }
    },
    [history, setForm]
  );

  return handler;
};

export default useForward;

import path from "path";
import fse from "misc/fse";
import xsession from "services/xsession";
import { IForm } from "./typing";
import message from "misc/message";
import { Dispatch, SetStateAction, useCallback } from "react";

const useExport = (setForm: Dispatch<SetStateAction<IForm>>) => {
  const exportFiles = useCallback(
    async (folders: McTelegramStat[], todir: string) => {
      folders.map(async it => {
        //收发报文件：
        const name = it.name;
        const targetPath = path.join(todir, name, path.basename(it.path));
        await fse.ensure(targetPath);
        fse.deepCopy(it.path, targetPath);

        //session文件
        const session: McSession = (await xsession.read(it.path)) as McSession;
        if (session && session.exists) {
          const targetSessionPath = path.join(todir, name, path.basename(session.path));
          await fse.ensure(targetSessionPath);
          fse.deepCopy(session.path, targetSessionPath);
        }
        setForm(form => ({
          ...form,
          checked: form.checked.filter(x => x !== it),
        }));
        return it;
      });
      message.success("导出文件", "导出文件成功");
    },
    [setForm]
  );

  return exportFiles;
};

export default useExport;

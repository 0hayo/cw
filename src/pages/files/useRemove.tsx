import fse from "misc/fse";
import message from "misc/message";
import { Modal } from "antd";
import { IForm } from "./typing";
import { Dispatch, SetStateAction, useCallback } from "react";
import fetch from "utils/fetch";
import { logInfo } from "misc/util";

const useRemove = (
  setForm: Dispatch<SetStateAction<IForm>>
): [(stat: McTelegramStat) => void, (folders: McTelegramStat[]) => void] => {
  const remove = useCallback(
    (stat: McTelegramStat) => {
      Modal.confirm({
        centered: true,
        maskClosable: false,
        title: "删除文件",
        content: `确定删除 ${stat.name} ？`,
        okType: "danger",
        onOk: async () => {
          logInfo("删除文件: " + stat.name);
          await fetch.delete<ManageResponse>("/sysTask/delete/" + stat.taskId);
          // fse.delete(stat.path);
          setForm(it => ({
            ...it,
            folders: it.folders.filter(x => x.path !== stat.path),
            checked: it.checked.filter(x => x.path !== stat.path),
          }));
          message.success("删除文件成功！");
          fse.delete(stat.path);
        },
      });
    },
    [setForm]
  );

  const batchRemove = useCallback(
    (folders: McTelegramStat[]) => {
      Modal.confirm({
        centered: true,
        maskClosable: false,
        title: "删除文件",
        content: `确定删除 ${folders.length} 个文件？`,
        okType: "danger",
        onOk: () => {
          folders.map(async f => {
            logInfo("删除文件: " + f.name);
            await fetch.delete<ManageResponse>("/sysTask/delete/" + f.taskId);
            fse.delete(f.path);
            setForm(it => ({
              ...it,
              folders: it.folders.filter(x => x.path !== f.path),
              checked: it.checked.filter(x => x.path !== f.path),
            }));
            return f;
          });
          message.success("删除文件成功！");
        },
      });
    },
    [setForm]
  );

  return [remove, batchRemove];
};

export default useRemove;

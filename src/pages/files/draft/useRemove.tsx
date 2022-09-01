import { Modal } from "antd";
import { IForm } from "./typing";
import { Dispatch, SetStateAction, useCallback } from "react";
import fetch from "utils/fetch";
import { logInfo } from "misc/util";

const useRemove = (setForm: Dispatch<SetStateAction<IForm>>) => {
  return useCallback(
    (stats: McTelegramStat[]) => {
      const names = [];
      const ids = [];
      stats.map(it => {
        names.push(it.name);
        ids.push(it.path);
        return it;
      });
      Modal.confirm({
        centered: true,
        maskClosable: false,
        title: "删除",
        content: names.join(", "),
        okType: "danger",
        onOk: async () => {
          logInfo("删除电子报底: " + names.join(", "));
          await fetch.delete<ManageResponse>("/sysDatagram/delete/", { data: JSON.stringify(ids) });
          // fse.delete(stat.path);
          setForm(it => {
            const _stats = it.folders.filter(x => !stats.find(y => y.path === x.path));
            return {
              ...it,
              folders: _stats,
              checked: [],
            };
          });
        },
      });
    },
    [setForm]
  );
};

export default useRemove;

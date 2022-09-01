import { Dispatch, SetStateAction, useCallback } from "react";
import { IForm } from "./typing";
import { Modal } from "antd";
import service from "./service";

const useRemove = (setForm: Dispatch<SetStateAction<IForm>>) => {
  return useCallback(
    (folders: McFolderMeta[]) => {
      const names = [];
      const ids = [];
      folders.map(it => {
        names.push(it.name);
        ids.push(it.id);
        return it;
      });
      Modal.confirm({
        centered: true,
        maskClosable: false,
        title: "删除",
        content: names.join(", "),
        okType: "danger",
        onOk: () => {
          service.delete(ids);
          setForm(it => ({
            ...it,
            folders: it.folders.filter(x => !folders.find(y => y.id === x.id)),
            checked: [],
          }));
        },
      });
    },
    [setForm]
  );
};

export default useRemove;

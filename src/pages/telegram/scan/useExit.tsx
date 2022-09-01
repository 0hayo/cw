import { Modal } from "antd";
import { IForm } from "./typing";
import { useCallback } from "react";
import { useHistory } from "react-router";
import { getAppType } from "misc/env";

const useExit = (): ((form: IForm) => void) => {
  const history = useHistory();
  const handler = useCallback(
    async (form: IForm) => {
      if (!form.saved) {
        Modal.confirm({
          okType: "danger",
          centered: true,
          maskClosable: false,
          title: "退出编辑",
          content: "您有修改未保存，确定要退出？",
          onOk: async () => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              if (getAppType() === "control") {
                history.push("/telegram");
              } else {
                history.push("/");
              }
            }
          },
        });
      } else {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          if (getAppType() === "control") {
            history.push("/telegram");
          } else {
            history.push("/");
          }
        }
      }
    },
    [history]
  );

  return handler;
};

export default useExit;

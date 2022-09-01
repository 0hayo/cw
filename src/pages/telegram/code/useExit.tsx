import { Modal } from "antd";
import { IForm } from "./typing";
import { useCallback } from "react";
import { useHistory } from "react-router";

const useExit = (): ((form: IForm) => void) => {
  const history = useHistory();
  const handler = useCallback(
    async (form: IForm) => {
      if (!form.saved) {
        Modal.confirm({
          okType: "danger",
          centered: true,
          maskClosable: false,
          title: "您确定要退出吗？",
          content: "您修改的报文将不会被保存，信息将会丢失。",
          onOk: async () => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              history.push("/telegram");
            }
          },
        });
      } else {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          history.push("/telegram");
        }
      }
    },
    [history]
  );

  return handler;
};

export default useExit;

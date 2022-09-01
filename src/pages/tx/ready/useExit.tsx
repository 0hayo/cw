// import { Modal } from "antd";
import { IForm } from "./typing";
// import message from "misc/message";
import { useCallback, useMemo } from "react";
import { useHistory, useLocation } from "react-router";
import qs from "query-string";
import { Modal } from "antd";
import message from "misc/message";
import { setTaskLabelCompleted } from "misc/env";

const useExit = (
  form: IForm,
  finish?: VoidFunction,
  showButton?: Boolean,
  stopSox?: VoidFunction
): ((form: IForm, finish?: VoidFunction, showButton?: Boolean) => void) => {
  const history = useHistory();
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const retpath = search.retpath ? (search.retpath as string) : "";
  const handler = useCallback(
    async (form: IForm) => {
      if (!showButton) {
        Modal.confirm({
          okType: "danger",
          centered: true,
          maskClosable: false,
          title: "您确定要退出吗？",
          content: "此次发报过程中产生的记录将不会被保存。",
          onOk: async () => {
            try {
              // history.push("/tx?silent=1");
              // history.push("/telegram");
              // history.push("/home");
              stopSox();
              setTimeout(() => {
                if (retpath === "send") {
                  history.push("/files/sent");
                } else {
                  history.push("/");
                }
                finish();
              }, 500);
            } catch (ex) {
              message.failure("发生错误", ex.message || ex.toString());
            }
          },
        });
      } else {
        // history.push("/home");
        if (retpath === "send") {
          history.push("/files/sent");
        } else {
          setTaskLabelCompleted("1");
          history.push("/home?type=show");
        }
        finish();
      }
      // alert(retpath);
    },
    //eslint-disable-next-line
    [history]
  );

  return handler;
};

export default useExit;

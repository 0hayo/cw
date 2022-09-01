import { max } from "misc/telegram";
import { IForm } from "./typing";
import { Dispatch, useCallback, SetStateAction } from "react";
import { Modal } from "antd";

const useClean = (setForm: Dispatch<SetStateAction<IForm>>): ((page: number) => void) => {
  const callback = useCallback(
    /**
     *
     * @param {number} page: page <= 0: 清空所有报文，page > 0，清空指定页码的报文
     */
    (page: number) => {
      if (page <= 0) {
        //删除所有页
        Modal.confirm({
          centered: true,
          maskClosable: false,
          content: "您确定要删除所有内容吗？",
          onOk: () => {
            setForm(it => ({
              ...it,
              body: {},
              page: 1,
              size: 1,
            }));
          },
        });
      } else {
        //删除指定页
        // const newSize =
        const start = (page - 1) * 100;
        const end = start + 99;
        const newBody: McTelegramHash = {};
        setForm(x => {
          const mx = max(x.body);
          let idx = 0;
          let n = 0;
          for (idx; idx <= mx; idx++) {
            if (idx < start || idx > end) {
              newBody[n] = x.body[idx];
              n++;
            }
          }
          const newPage = page * 100 > n ? page - 1 : page;
          return {
            ...x,
            size: n < 1 ? 1 : n,
            page: newPage < 1 ? 1 : newPage,
            body: newBody,
          };
        });
      }
    },
    [setForm]
  );
  return callback;
};

export default useClean;

import fetch from "utils/fetch";
import { Dispatch, SetStateAction, useEffect } from "react";
import { IFormTxPages } from "./types";

/** 获取待发报文列表 */
const UseTask = (
  telegram: IPageResult<ITelegram>,
  pages: IFormTxPages,
  setTelegram: Dispatch<SetStateAction<IPageResult<ITelegram>>>,
  reload: boolean
) => {
  // 获取 待发报文 请求
  useEffect(() => {
    const wait = fetch.post<ManageResponse>("/sysDatagram/listPage", JSON.stringify(pages));
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) {
        setTelegram(x => ({
          ...x,
          totalPage: result.data.totalPage,
          items:
            !telegram || reload ? result.data.items : [...telegram.items, ...result.data.items],
          // items:  result.data.items ,
        }));
      }
    });
    // eslint-disable-next-line
  }, [pages, reload, setTelegram]);
};

export default UseTask;

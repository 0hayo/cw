import fetch from "utils/fetch";
import { Dispatch, SetStateAction, useEffect } from "react";
// import { IFormPages } from "../form";

/** 获取任务列表 */
const useLog = (setForm: Dispatch<SetStateAction<ILogList>>, pages: IFormPages) => {
  useEffect(() => {
    console.log("pages", pages);
    const wait = fetch.post<ManageResponse>("/sysOperationLog/listPage", JSON.stringify(pages));
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) {
        setForm(x => ({
          ...x,
          totalPage: result.data.totalPage,
          totalNum: result.data.totalNum,
          items: !x?.items ? result.data.items : [...x.items, ...result.data.items],
        }));
      }
    });
  }, [pages, setForm]);
};

export default useLog;

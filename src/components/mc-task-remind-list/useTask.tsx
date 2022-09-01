import fetch from "utils/fetch";
import { Dispatch, SetStateAction, useEffect } from "react";
// import { IFormPages } from "../form";

/** 获取任务列表 */
const UseTask = (
  // taskList: ITaskList,
  setForm: Dispatch<SetStateAction<ITaskList>>,
  pages: IFormPages,
  reload: boolean
) => {
  useEffect(() => {
    const wait = fetch.post<ManageResponse>("/sysTask/listPage", JSON.stringify(pages));
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
    // eslint-disable-next-line
  }, [pages, reload, setForm]);
};

export default UseTask;

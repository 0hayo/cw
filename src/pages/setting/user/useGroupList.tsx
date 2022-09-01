import { Dispatch, SetStateAction, useEffect } from "react";
import message from "misc/message";
import fetch from "utils/fetch";

const useGroupList = (
  pages: IFormPages,
  setForm: Dispatch<SetStateAction<IGroup[]>>,
  group,
  setCurrGroup: Dispatch<SetStateAction<IGroup>>
) => {
  // 获取班组列表数据
  useEffect(() => {
    if (group.add) return;
    const wait = fetch.post<ManageResponse>("/sysGroup/listPage", JSON.stringify(pages));
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) {
        setForm(x => result.data.items.sort((a, b) => (a.id > b.id ? 1 : -1)));
        setCurrGroup(result.data.items[0]);
      } else {
        message.failure(result.message);
      }
    });
    // eslint-disable-next-line
  }, [pages, setForm, group, setCurrGroup]);
};

export default useGroupList;

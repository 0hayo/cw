import { Dispatch, SetStateAction, useEffect } from "react";
import message from "misc/message";
import fetch from "utils/fetch";

const useAccount = (
  pages: IFormPages,
  setForm: Dispatch<SetStateAction<IUser[]>>,
  type,
  groupName: string
) => {
  // 获取账号列表
  useEffect(() => {
    if (type.add) return;
    const data = Object.assign({}, pages, { groupName });
    const wait = fetch.post<ManageResponse>("/sysUserAccount/listPage", JSON.stringify(data));
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) setForm(x => result.data.items);
      else message.failure(result.message);
    });
    // eslint-disable-next-line
  }, [pages, setForm, type, groupName]);
};

export default useAccount;

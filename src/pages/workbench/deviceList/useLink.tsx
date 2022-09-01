import message from "misc/message";
import { Dispatch, SetStateAction, useCallback } from "react";
import fetch from "utils/fetch";
// 班组保存

const useLink = (): ((
  uuid: string,
  status: number,
  name: string,
  setPages: Dispatch<SetStateAction<IFormPages>>
) => void) => {
  const link = useCallback(
    async (
      uuid: string,
      status: number,
      name: string,
      setPages: Dispatch<SetStateAction<IFormPages>>
    ) => {
      try {
        // 通过id 判断 是更新班组 or 新增班组
        const wait = await fetch.put<ManageResponse>(
          "/sysRadio/update",
          JSON.stringify({ uuid, status })
        );
        Promise.resolve(wait).then(response => {
          const result = response.data;
          if (result.status === 1) {
            const successMsg = status === 1 ? "已成功接管设备" : "已取消接管设备";
            message.success(name, successMsg);
            setPages(x => ({ ...x }));
          } else {
            message.failure(name, result.msg);
          }
        });
      } catch (ex) {
        message.failure("操作失败", ex.message || ex.toString());
      } finally {
      }
    },
    []
  );

  return link;
};

export default useLink;

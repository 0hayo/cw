import message from "misc/message";
import { useCallback } from "react";
import fetch from "utils/fetch";

const useRemove = (): ((id: string) => void) => {
  const remove = useCallback(async (id: string) => {
    try {
      if (!id) return;
      const wait = await fetch.delete<ManageResponse>(`/sysDatagram/delete/${id}`);
      Promise.resolve(wait).then(response => {
        const result = response.data;
        console.error(111);
        if (result.status === 1) message.success("删除成功", "成功", false, 15);
        // message.
      });
    } catch (ex) {
      console.error(ex);
      message.failure("发生错误", ex.message || ex.toString());
    } finally {
    }
  }, []);

  return remove;
};

export default useRemove;

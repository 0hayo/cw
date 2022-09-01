import message from "misc/message";
import { useCallback } from "react";
import fetch from "utils/fetch";

const useRemove = (): ((id: number) => void) => {
  const remove = useCallback(async (id: number) => {
    try {
      if (!id) return;
      const wait = await fetch.delete<ManageResponse>(`/sysCallTerm/delete/${id}`);
      Promise.resolve(wait).then(response => {
        const result = response.data;
        if (result.status === 1) message.success("删除短语成功。");
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

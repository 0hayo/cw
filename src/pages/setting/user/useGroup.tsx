import message from "misc/message";
import { useCallback } from "react";
import fetch from "utils/fetch";
// 班组保存

const useGroup = (): {
  save: (content: string, id: number) => void;
  remove: (id: number) => void;
} => {
  const save = useCallback(async (content: string, id: number) => {
    try {
      if (!content || content.trim() === "") return message.failure("请输入班组名称。");
      // 通过id 判断 是更新班组 or 新增班组
      const response = id
        ? await fetch.put<ManageResponse>(
            "/sysGroup/update",
            JSON.stringify({ groupName: content, id })
          )
        : await fetch.post<ManageResponse>(
            "/sysGroup/insert",
            JSON.stringify({ groupName: content })
          );

      const result = response.data;
      if (result.status === 1) message.success("保存班组成功。");
    } catch (ex) {
      console.error(ex);
      message.failure("保存班组失败", ex.message || ex.toString());
    } finally {
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      const wait = await fetch.delete<ManageResponse>(`/sysGroup/delete/${id}`);
      Promise.resolve(wait).then(response => {
        const result = response.data;
        if (result.status === 1) message.success("删除班组成功。");
      });
    } catch (ex) {
      console.error(ex);
      message.failure("发生错误", ex.message || ex.toString());
    } finally {
    }
  }, []);

  return { save, remove };
};

export default useGroup;

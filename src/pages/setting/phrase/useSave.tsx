import message from "misc/message";
import { useCallback } from "react";
import fetch from "utils/fetch";
// 短语保存

const useSave = (): ((
  type: "rx" | "tx",
  datagram: string,
  content: string,
  id: number
) => void) => {
  const save = useCallback(
    async (type: "rx" | "tx", datagram: string, content: string, id: number) => {
      try {
        if (!datagram || datagram.trim() === "") message.failure("请输入短语代码。");

        if (!content || content.trim() === "") message.failure("请输入短语含义。");

        const data = {
          type,
          datagram,
          content,
        };

        if (id) Object.assign(data, { id });
        // 通过id 判断 是更新短语 or 新增短语
        const url = id
          ? fetch.put<ManageResponse>("/sysCallTerm/update", JSON.stringify(data))
          : fetch.post<ManageResponse>("/sysCallTerm/insert", JSON.stringify(data));

        const wait = await url;
        Promise.resolve(wait).then(response => {
          const result = response.data;
          if (result.status === 1) {
            message.success("勤务短语内容已保存。");
          }
        });
      } catch (ex) {
        console.error(ex);
        message.failure("保存勤务短语失败", ex.message || ex.toString());
      } finally {
      }
    },
    []
  );

  return save;
};

export default useSave;

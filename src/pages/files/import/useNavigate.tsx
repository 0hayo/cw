import message from "misc/message";
import { useCallback } from "react";
import { useHistory } from "react-router";

const useNavigate = () => {
  const history = useHistory();

  return useCallback(
    async (id: string, mode: McUploadFileType) => {
      try {
        const newMode = "DOC" === mode ? "docx" : "JSON" === mode ? "json" : "photo";
        history.push(`/telegram/scan?sysFilesId=${encodeURIComponent(id)}&mode=${newMode}`);
      } catch (e) {
        message.failure("读取错误", "无效文件");
        console.error(e);
      }
      return;
    },
    [history]
  );
};

export default useNavigate;

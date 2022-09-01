import service from "./service";
import message from "misc/message";
import useMounted from "hooks/useMounted";
import { useCallback, useState } from "react";

const useUpload = (callback: () => void): [(name: string, files: File[]) => void, boolean] => {
  const mounted = useMounted();
  const [loading, setLoading] = useState(false);

  const upload = useCallback(
    async (name: string, files: File[]) => {
      if (files[0]) {
        setLoading(true);

        try {
          await service.upload(name, files);
          mounted.current && callback();
        } catch (ex) {
          message.failure("上传失败", ex.message || ex.toString());
        } finally {
          mounted.current && setLoading(false);
        }
      }
    },
    [callback, mounted]
  );

  return [upload, loading];
};

export default useUpload;

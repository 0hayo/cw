import { useEffect } from "react";
import useFetch from "hooks/useFetch";
import service from "services/phrase-service";
import message from "misc/message";

const useData = (type: "tx" | "rx") => {
  const [request, response, , ex] = useFetch<McPhrase[]>(service.listDB, []);
  useEffect(() => {
    request(type);
  }, [request, type]);

  useEffect(() => {
    if (ex) {
      message.failure("加载短语错误：", ex.message || ex.toString());
    }
  }, [ex]);

  return response;
};

export default useData;

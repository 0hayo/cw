import service from "./service";
import message from "misc/message";
import { useEffect } from "react";
import useFetch from "hooks/useFetch";

const useData = () => {
  const [request, response, , ex] = useFetch<McTelegramStat[]>(service.list, []);

  useEffect(() => {
    request();
  }, [request]);

  useEffect(() => {
    if (ex) {
      message.failure("加载错误：", ex.message || ex.toString());
    }
  }, [ex]);

  return response;
};

export default useData;

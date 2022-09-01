import { useEffect, useState } from "react";
import message from "misc/message";
import useFetch from "hooks/useFetch";
import service from "services/format-service";

const useData = (type: TelegramBizType): [McFmttmpl[], string] => {
  const [shim, setShim] = useState("");
  const [request, response, , ex] = useFetch<McFmttmpl[]>(service.list, []);

  useEffect(() => {
    request(type);
  }, [type, request]);

  useEffect(() => {
    const exist = response.find(x => x.default);
    if (exist) {
      setShim(exist.name);
    }
  }, [response]);

  useEffect(() => {
    if (ex) {
      message.failure("报文格式", ex.message || ex.toString());
    }
  }, [ex]);

  return [response, shim];
};

export default useData;

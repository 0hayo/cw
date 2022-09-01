import qs from "query-string";
import { IForm } from "./typing";
import xchat from "services/xchat";
import message from "misc/message";
import useFetch from "hooks/useFetch";
import { useLocation } from "react-router";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";

const useChat = (setForm: Dispatch<SetStateAction<IForm>>) => {
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  // const [request, response, , ex] = useFetch<Message[]>(xchat.read, []);
  const [request, response, , ex] = useFetch<Message[]>(xchat.readServer, []);
  const dir = search.dir as string;

  useEffect(() => {
    if (dir) {
      request(dir);
    }
  }, [dir, request]);

  useEffect(() => {
    if (response) {
      setForm(it => ({
        ...it,
        messages: [...response, ...it.messages],
      }));
    }
  }, [response, setForm]);

  useEffect(() => {
    if (ex) {
      message.failure("发生错误", ex.message || ex.toString());
    }
  }, [ex]);
};

export default useChat;

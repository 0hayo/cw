import { Dispatch, SetStateAction, useEffect } from "react";
import { IForm } from "./typing";
import message from "misc/message";
import { cover, size, trim } from "misc/telegram";

const usePaste = (setForm: Dispatch<SetStateAction<IForm>>) => {
  useEffect(() => {
    const pasteHandler = (event: ClipboardEvent) => {
      //读取剪贴板
      const plaintext = event.clipboardData.getData("text/plain");
      if (!plaintext) {
        message.warning("只能拷贝粘贴纯文本数据");
        return;
      }
      //去除换行，替换空格
      const data = plaintext
        .replaceAll(" ", ",")
        .replaceAll("\n", ",")
        .replaceAll("\r", ",")
        .replaceAll(",,,", ",")
        .replaceAll(",,", ",");

      const codes = data.split(",");

      setForm(x => {
        console.log("current active = ", x.active);
        const currIndex = x.active === -1 ? 0 : x.active;
        const body = x.body;
        const newBody = trim(cover(body, currIndex, codes));
        return {
          ...x,
          body: newBody,
          size: size(newBody),
          saved: false,
        };
      });
    };
    document.body.addEventListener("paste", pasteHandler);

    return () => {
      document.body.removeEventListener("paste", pasteHandler);
    };
  }, [setForm]);
};

export default usePaste;

import { max, trim, size } from "misc/telegram";
import { useEffect, Dispatch, SetStateAction } from "react";
import { IForm } from "./typing";

/**
 * 自动填充/更新报头的组数（CK）
 */
const useAutoCK = (form: IForm, setForm: Dispatch<SetStateAction<IForm>>) => {
  useEffect(() => {
    setForm(x => {
      const body = trim(x.body);
      let actualSze = Math.ceil(size(body));
      let trimSize = Math.ceil(max(body)) + 1;
      if (actualSze <= trimSize) {
        actualSze = trimSize;
      }
      const sizeStr = actualSze > 0 ? (actualSze > 9 ? actualSze + "" : "0" + actualSze) : "";
      let showSize = trimSize;
      if (showSize <= x.size) {
        showSize = x.size;
      } else {
        showSize = showSize + 1;
      }
      //更新报头组数（CK）
      const newCK: McTelegramWord = { ...x.head["CK"], value: sizeStr, warn: false };
      return {
        ...x,
        body: body,
        head: { ...x.head, CK: newCK },
        size: showSize === 0 ? 1 : showSize,
      };
    });
  }, [form.body, setForm]);
};

export default useAutoCK;

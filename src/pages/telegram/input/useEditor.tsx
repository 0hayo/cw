import { IForm } from "./typing";
import { trim, max } from "misc/telegram";
import { MceInstance } from "mce/typing";
import { useCallback, Dispatch, SetStateAction } from "react";
import { field2index } from "misc/util";

const useEditor = (
  setForm: Dispatch<SetStateAction<IForm>>
): {
  handleReady: (mci: MceInstance) => void;
} => {
  const calcuPage = (size: number, page: number): number => {
    const pages = Math.ceil(size / 100);
    const gotoPage = page <= pages ? page : page - 1;
    return gotoPage < 1 ? 1 : gotoPage;
  };

  const handleReady = useCallback(
    (mci: MceInstance) => {
      mci.on("head:change", (field, value) => {
        setForm(it => {
          it.head[field] = {
            ...it.head[field],
            warn: false,
            value,
          };
          return {
            ...it,
            head: { ...it.head },
            saved: false,
          };
        });
      });

      mci.on("body:change", (field, value) => {
        setForm(it => {
          it.body[field] = {
            ...it.body[field],
            value,
          };
          const body = trim(it.body);
          // const body = it.body;
          let size = Math.ceil(max(body) + 1);
          if (size < it.size) size = it.size;
          const gotoPage = calcuPage(size, it.page);
          return {
            ...it,
            offset: parseInt(field),
            body: { ...it.body },
            size: size === 0 ? 1 : size,
            page: gotoPage,
            saved: false,
          };
        });
      });

      mci.on("head:click", (index, field) => {
        setForm(x => ({
          ...x,
          offset: index,
          active: field2index(field, x.type, "head"),
          role: "head",
        }));
      });
      mci.on("head:focus", (index, field) => {
        setForm(x => ({
          ...x,
          offset: index,
          active: field2index(field, x.type, "head"),
          role: "head",
        }));
      });

      mci.on("body:click", index => {
        setForm(x => ({
          ...x,
          offset: index,
          active: index,
          role: "body",
        }));
      });
    },
    [setForm]
  );

  return {
    handleReady,
  };
};

export default useEditor;

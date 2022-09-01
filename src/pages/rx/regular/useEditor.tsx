import { IForm } from "../typing";
import { MceInstance } from "mce/typing";
import { useCallback, Dispatch, SetStateAction } from "react";
import {
  // each,
  trim,
  max,
  regularInsert,
  regularSplit,
  regularDelete,
  regularMerge,
} from "misc/telegram";
import useWarn from "../useWarn";

const useEditor = (
  setForm: Dispatch<SetStateAction<IForm>>
): {
  handleReady: (mci: MceInstance) => void;
  handleChange: (role: "head" | "body", field: string, value: string) => void;
} => {
  const markWarn = useWarn(setForm);

  // const calcuPage = (size: number, page: number): number => {
  //   const pages = Math.ceil(size / 100);
  //   const gotoPage = page <= pages ? page : page - 1;
  //   return gotoPage < 1 ? 1 : gotoPage;
  // };

  const handleChange = useCallback(
    (role: "head" | "body", field: string, value: string) => {
      setForm(form => {
        form.regular[role][field] = {
          ...form.regular[role][field],
          value,
        };

        return { ...form };
      });
    },
    [setForm]
  );

  const handleReady = useCallback(
    (mci: MceInstance) => {
      mci.on("head:change", (field, value) => {
        setForm(it => {
          it.regular.head[field] = {
            ...it.regular.head[field],
            crude: it.head[field]?.value,
            value,
          };
          markWarn(it.regular.head, it.regular.body);
          return {
            ...it,
            saved: false,
          };
        });
      });

      mci.on("body:change", (field, value) => {
        setForm(it => {
          it.regular.body[field] = {
            ...it.regular.body[field],
            value,
            crude: it.body[field]?.value,
          };
          const body = trim(it.regular.body);
          let size = Math.ceil(max(body) + 1);
          if (size < it.size) size = it.size;
          // const gotoPage = calcuPage(size, it.page);
          markWarn(it.regular.head, it.regular.body);
          return {
            ...it,
            regular: {
              ...it.regular,
              // page: gotoPage,
            },
            saved: false,
          };
        });
      });

      mci.on("head:click", index => {
        setForm(x => ({
          ...x,
          regular: {
            ...x.regular,
            // offset: index,
            role: "head",
          },
        }));
      });

      mci.on("body:click", index => {
        setForm(x => ({
          ...x,
          regular: {
            ...x.regular,
            offset: index,
            role: "body",
          },
        }));
      });

      mci.on("head:dblclick", (index, field) => {
        setForm(x => {
          return x.regular.head[field]
            ? {
                ...x,
                regular: {
                  ...x.regular,
                  role: "head",
                },
                ui: {
                  ...x.ui,
                  code: true,
                },
              }
            : x;
        });
      });

      mci.on("body:dblclick", (index, field) => {
        setForm(x => {
          return x.regular.body[field]
            ? {
                ...x,
                regular: {
                  ...x.regular,
                  offset: index,
                  role: "body",
                },
                ui: {
                  ...x.ui,
                  code: true,
                },
              }
            : x;
        });
      });

      // mci.on("body:mousemove", (index: number, field: string, movein: boolean) => {
      //   setForm(x => {
      //     each(x.regular.body, (k, v) => {
      //       if (k === index.toString()) {
      //         x.regular.body[k] = {
      //           ...x.regular.body[k],
      //           value: x.regular.body[k]?.value as string,
      //           light: movein,
      //         };
      //       }
      //     });
      //     return {
      //       ...x,
      //     };
      //   });
      // });

      mci.on("body:regularInsert", (index: number) => {
        setForm(x => {
          const body = regularInsert(x.regular.body, index);
          markWarn(x.regular.head, x.regular.body);
          return {
            ...x,
            regular: {
              ...x.regular,
              body,
              size: max(body),
            },
          };
        });
      });

      mci.on("body:regularSplit", (index: number, splitIdx: number) => {
        setForm(x => {
          const body = regularSplit(x.regular.body, index, splitIdx);
          markWarn(x.regular.head, x.regular.body);
          return {
            ...x,
            regular: {
              ...x.regular,
              body,
              size: max(body),
            },
          };
        });
      });

      mci.on("body:regularDelete", (dx: number, dy: number) => {
        setForm(x => {
          const body = regularDelete(x.regular.body, dx, dy);
          markWarn(x.regular.head, x.regular.body);
          return {
            ...x,
            regular: {
              ...x.regular,
              body,
              size: max(body),
            },
          };
        });
      });

      mci.on("body:regularMerge", (dx: number, dy: number) => {
        setForm(x => {
          const body = regularMerge(x.regular.body, dx, dy);
          markWarn(x.regular.head, x.regular.body);
          return {
            ...x,
            regular: {
              ...x.regular,
              body,
              size: max(body),
            },
          };
        });
      });

      mci.on("body:regularPlay", (dx: number) => {
        setForm(x => ({
          ...x,
          ui: {
            ...x.ui,
            code: true,
          },
        }));
      });
    },
    [setForm, markWarn]
  );

  return {
    handleReady,
    handleChange,
  };
};

export default useEditor;

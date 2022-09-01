import { Modal } from "antd";
import { IForm } from "./typing";
import { drop, trim, move, max, remove } from "misc/telegram";
import { MceInstance } from "mce/typing";
import { useCallback, Dispatch, SetStateAction } from "react";
import { field2index } from "misc/util";

const useEditor = (
  setForm: Dispatch<SetStateAction<IForm>>
): {
  handleReady: (mci: MceInstance) => void;
  // handleIncrease: VoidFunction;
  handleIncrease: (form: IForm) => void;
  handleDecrease: (form: IForm) => void;
  handleInsertPage: (form: IForm) => void;
} => {
  const calcuPage = (size: number, page: number): number => {
    const pages = Math.ceil(size / 100);
    const gotoPage = page <= pages ? page : page - 1;
    return gotoPage < 1 ? 1 : gotoPage;
  };

  /** （在最后）加页 */
  // const handleIncrease = useCallback(() => {
  //   setForm(it => {
  //     return {
  //       ...it,
  //       page: it.page + 1,
  //       size: it.size + 100,
  //       saved: false,
  //     };
  //   });
  // }, [setForm]);

  /** 后插页 */
  const handleIncrease = useCallback(
    (form: IForm) => {
      const currPage = form.page;
      const start = 100 * currPage;
      // alert(start);
      const body = move(form.body, start, 100);
      const page = currPage + 1;
      setForm(it => {
        return {
          ...it,
          body: { ...body },
          page: page,
          size: it.size + 100,
          offset: (page - 1) * 100,
          saved: false,
        };
      });
    },
    [setForm]
  );

  /** 插页 */
  const handleInsertPage = useCallback(
    (form: IForm) => {
      const currPage = form.page;
      const start = 100 * (currPage - 1);
      const body = move(form.body, start, 100);
      const page = currPage + 1;
      setForm(it => {
        return {
          ...it,
          body: { ...body },
          page: page,
          size: it.size + 100,
          offset: (page - 1) * 100,
          saved: false,
        };
      });
    },
    [setForm]
  );

  const handleDecrease = useCallback(
    (form: IForm) => {
      const currPage = form.page;
      Modal.confirm({
        centered: true,
        maskClosable: false,
        content: `您确定要删除第${currPage}页吗？`,
        onOk: () => {
          setForm(it => {
            const size = it.size - 100;
            const gotoPage = calcuPage(size, currPage);
            return {
              ...it,
              body: drop(it.body, it.page),
              size: size,
              page: gotoPage < 1 ? 1 : gotoPage,
              saved: false,
            };
          });
        },
      });
    },
    [setForm]
  );

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
      mci.on("body:focus", index => {
        setForm(x => {
          return {
            ...x,
            offset: index,
            active: index,
            role: "body",
          };
        });
      });

      mci.on("body:insertCell", () => {
        setForm(x => {
          const currPage = x.page;
          const body = move(x.body, x.offset + 1, 1);
          const size = x.size + 1;
          const gotoPage = calcuPage(size, currPage);
          return {
            ...x,
            role: "body",
            body: { ...body },
            size: size === 0 ? 1 : size,
            page: gotoPage,
            saved: false,
          };
        });
      });

      mci.on("body:deleteCell", () => {
        setForm(x => {
          const currPage = x.page;
          const body = remove(x.body, x.offset);
          const size = Math.ceil(max(body) + 1);
          const gotoPage = calcuPage(size, currPage);
          return {
            ...x,
            role: "body",
            body: { ...body },
            size: size === 0 ? 1 : size,
            page: gotoPage,
            saved: false,
          };
        });
      });

      mci.on("body:cleanCell", () => {
        setForm(x => {
          const currPage = x.page;
          const body = trim(x.body);
          const size = Math.ceil(max(body) + 1);
          const gotoPage = calcuPage(size, currPage);
          return {
            ...x,
            role: "body",
            body: { ...body },
            size: size === 0 ? 1 : size,
            page: gotoPage,
            saved: false,
          };
        });
      });

      mci.on("body:insertRow", () => {
        setForm(x => {
          let offset = x.offset;
          //找到下一行开头
          const start = offset - ((offset % 100) % 10) + 10;
          const currPage = x.page;
          const body = move(x.body, start, 10);
          const size = x.size + 10;
          let gotoPage = calcuPage(size, currPage);
          if (offset % 100 === 99) {
            gotoPage = gotoPage + 1;
            offset = offset + 1;
          } else {
            offset = offset + 10;
          }
          return {
            ...x,
            role: "body",
            body: { ...body },
            offset: offset,
            size: size === 0 ? 1 : size,
            page: gotoPage,
            saved: false,
          };
        });
      });
      //删除一行
      mci.on("body:deleteRow", () => {
        setForm(x => {
          const offset = x.offset;
          //找到下一行开头
          const start = offset - ((offset % 100) % 10) + 10;
          const currPage = x.page;
          const body = move(x.body, start, -10);
          const size = Math.ceil(max(body) + 1);
          const gotoPage = calcuPage(size, currPage);
          return {
            ...x,
            role: "body",
            body: { ...body },
            size: size === 0 ? 1 : size,
            page: gotoPage,
            saved: false,
          };
        });
      });
      //向前删除所有
      mci.on("body:deleteFront", () => {
        setForm(x => {
          const offset = x.offset;
          //找到下一行开头
          const body = move(x.body, offset, -offset);
          const size = Math.ceil(max(body) + 1);
          const gotoPage = calcuPage(size, 1);
          return {
            ...x,
            role: "body",
            body: { ...body },
            size: size === 0 ? 1 : size,
            page: gotoPage,
            offset: 0,
            active: 0,
            saved: false,
          };
        });
      });
      //向后删除所有
      mci.on("body:deleteBehind", () => {
        setForm(x => {
          const offset = x.offset;
          //找到下一行开头
          const currPage = x.page;
          const body = move(x.body, x.size, -(x.size - offset - 1));
          const size = Math.ceil(max(body) + 1);
          const gotoPage = calcuPage(size, currPage);
          return {
            ...x,
            role: "body",
            body: { ...body },
            size: size === 0 ? 1 : size,
            page: gotoPage,
            saved: false,
          };
        });
      });
    },
    [setForm]
  );

  return {
    handleReady,
    handleIncrease,
    handleDecrease,
    handleInsertPage,
  };
};

export default useEditor;

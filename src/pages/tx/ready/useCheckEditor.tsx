import { IForm } from "./typing";
import { trim, max, join, value } from "misc/telegram";
import { MceInstance } from "mce/typing";
import { useCallback, Dispatch, SetStateAction } from "react";
import { clone } from "lodash";
import exec from "services/exec";
import message from "misc/message";

const useCheckEditor = (
  setForm: Dispatch<SetStateAction<IForm>>
): {
  handleReady: (mci: MceInstance) => void;
  handleApply: () => void;
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
          it.check.head[field] = {
            ...it.check.head[field],
            value,
          };
          return {
            ...it,
            check: {
              ...it.check,
              head: { ...it.check.head },
            },
          };
        });
      });

      mci.on("body:change", (field, value) => {
        setForm(it => {
          it.check.body[field] = {
            ...it.check.body[field],
            value,
          };
          const body = trim(it.check.body);
          let size = Math.ceil(max(body) + 1);
          if (size < it.check.size) size = it.check.size;
          const gotoPage = calcuPage(size, it.check.page);
          return {
            ...it,
            check: {
              ...it.check,
              body: { ...it.check.body },
              size: size === 0 ? 1 : size,
              page: gotoPage,
            },
          };
        });
      });

      mci.on("head:click", (index, field) => {
        setForm(x => ({
          ...x,
          check: {
            ...x.check,
            offset: index,
          },
        }));
      });
      mci.on("head:focus", index => {
        setForm(x => ({
          ...x,
          check: {
            ...x.check,
            offset: index,
          },
        }));
      });

      mci.on("body:click", index => {
        setForm(x => ({
          ...x,
          check: {
            ...x.check,
            offset: index,
            active: index,
          },
        }));
      });
      mci.on("body:focus", index => {
        setForm(x => {
          return {
            ...x,
            check: {
              ...x.check,
              offset: index,
              active: index,
            },
          };
        });
      });
    },
    [setForm]
  );

  const handleApply = useCallback(async () => {
    setForm(form => {
      const head = clone(form.check.head);
      const body = clone(form.check.body);
      return {
        ...form,
        head,
        body,
      };
    });
    setForm(form => {
      const head = form.head;
      const body = form.body;
      const json = JSON.stringify({
        tag: "TelegramScript",
        isSender: true,
        type: form.type,
        body: join(body),
        nr: value(head["NR"]),
        ck: value(head["CK"]),
        cls: value(head["CLS"]),
        date: value(head["DATE"]),
        time: value(head["TIME"]),
        rmks: value(head["RMKS"]),
      });
      exec(`runjson -json ${json}`, {
        onData: payload => {
          // if (payload && ("Error" === payload.tag || payload.rc !== 0))
          // {
          //   message.failure("更新电子报底", "更新失败:" + payload.message);
          // }else
          if (payload.tag === "SetupResult") {
            if (form.type === "EX") {
              setForm(x => {
                x["head"]["RMKS"] = {
                  ...x["head"]["RMKS"],
                  value: payload.values.RMKS.text,
                  crude: payload.values.RMKS.crude,
                  light: true,
                  // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
                };
                return {
                  ...x,
                };
              });
            } else {
              setForm(x => {
                x["head"]["RMKS"] = {
                  ...x["head"]["RMKS"],
                  value: payload.values.RMKS.text,
                  crude: payload.values.RMKS.crude,
                  light: true,
                  // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
                };
                x["head"]["CLS"] = {
                  ...x["head"]["CLS"],
                  value: payload.values.CLS.text,
                  crude: payload.values.CLS.crude,
                  light: true,
                  // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
                };

                return {
                  ...x,
                };
              });
            }

            message.success("更新电子报底", "更新成功。");
          } else if (payload.tag === "RptResult") {
            // alert(1);
            // messenger.success("收报完成", payload.tag);
            if (payload.types === "body") {
              const values = payload.values;
              const keys = Object.keys(values);
              keys.forEach(k => {
                setForm(x => {
                  console.log("before", x["body"][k + ""]);
                  x["body"][k + ""] = {
                    ...x["body"][k + ""],
                    value: values[k].text,
                    crude: values[k].crude,
                    light: true,
                    // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
                  };
                  console.log("after", x["body"][k + ""]);
                  // const head = x.head;
                  // const body = x.body;
                  // markWarn(head, body);
                  return {
                    ...x,
                    page: Math.max(1, Math.ceil((parseInt(k) + 1) / 100)),
                  };
                });
                // hash[k] = {
                //   value: body[k].text,
                //   crude: body[k].text,
                //   ratio: body[k].qualities,
                //   offset: offset(body[k]),
                //   length: length(body[k]),
                // };
              });
            }
          } else {
            message.success("更新电子报底", "更新成功。");
          }
        },
        onError: () => {
          message.failure("更新电子报底", "连接错误。");
        },
        onClose: () => {},
      });
      return {
        ...form,
      };
    });
  }, [setForm]);

  return {
    handleReady,
    handleApply,
  };
};

export default useCheckEditor;

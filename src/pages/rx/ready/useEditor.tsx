import { Socket } from "net";
import { setter, DUMB_FEED } from "../typing";
import exec from "services/exec";
import message from "misc/message";
import isEmpty from "lodash/isEmpty";
import useMounted from "hooks/useMounted";
import useWarn from "../useWarn";
import { MceInstance } from "mce/typing";
import { position } from "misc/telegram";
import { Modal } from "antd";
import { useCallback, MutableRefObject } from "react";
import parser from "services/parser";

const useEditor = (
  socket: MutableRefObject<Socket | undefined>,
  setForm: setter
): {
  handleReady: (mci: MceInstance) => void;
  handleChange: (role: "head" | "body", field: string, value: string) => void;
} => {
  const mounted = useMounted();
  const markWarn = useWarn(setForm);
  const handleReady = useCallback(
    (mci: MceInstance) => {
      mci.on("head:click", (index, field) => {
        setForm(form => {
          const item = form.head[field];
          if (item) {
            return {
              ...form,
              role: "head",
              // code: item.value,
              offset: index,
            };
          }
          return form;
        });
      });

      mci.on("body:click", (index, field) => {
        setForm(form => {
          const item = form.body[field];
          if (item) {
            return {
              ...form,
              role: "body",
              // code: item.value,
              offset: index,
            };
          }
          return form;
        });
      });

      mci.on("head:contextMenu", (index, field) => {
        setForm(form => {
          const item = form.head[field];
          if (item) {
            return {
              ...form,
              role: "head",
              // code: item.value,
              offset: index,
            };
          }
          return form;
        });
      });

      mci.on("body:contextMenu", (index, field) => {
        setForm(form => {
          const item = form.body[field];
          if (item) {
            return {
              ...form,
              role: "body",
              // code: item.value,
              offset: index,
            };
          }
          return form;
        });
      });

      // mci.on("head:dblclick", (index, field) => {
      //   setForm(x => {
      //     return x.head[field]
      //       ? {
      //           ...x,
      //           role: "head",
      //           offset: index,
      //           ui: {
      //             ...x.ui,
      //             code: true,
      //           },
      //         }
      //       : x;
      //   });
      // });

      // mci.on("body:dblclick", index => {
      //   setForm(x => {
      //     return x.body[index]
      //       ? {
      //           ...x,
      //           role: "body",
      //           offset: index,
      //           ui: {
      //             ...x.ui,
      //             code: true,
      //           },
      //         }
      //       : x;
      //   });
      // });

      // 请求重发所选报头
      mci.on("head:send", field => {
        const mapper: {
          [x: string]: string | undefined;
        } = {
          NR: "askToRepeatHeadFieldNr",
          CK: "askToRepeatHeadFieldCk",
          CLS: "askToRepeatHeadFieldCls",
          DATE: "askToRepeatHeadFieldDate",
          TIME: "askToRepeatHeadFieldTime",
          RMKS: "askToRepeatHeadFieldRmks",
          PBL: "askToRepeatHeadFieldAll",
        };

        if (isEmpty(mapper[field])) {
          return;
        }

        Modal.confirm({
          centered: true,
          maskClosable: false,
          title: `请求重发所选报头: ${field} ？`,
          okType: "danger",
          onOk: () => {
            setForm(x => {
              return { ...x, sendStatus: true, sendNumber: x.sendNumber + 1 };
            });
            setForm(form => {
              socket.current = exec(`morse-tx -speed ${form.speed} -shortcut ${mapper[field]}`, {
                onData: payload => {
                  if (payload.tag === "Error") {
                    message.failure("收报模块错误", payload.message);
                    return;
                  }
                  if (payload.tag === "TxResult") {
                    //将己方发送的内容，回显到feed格子里，以便观测发送进度
                    if (payload.progress !== 100) {
                      setForm(x => {
                        return {
                          ...x,
                          feed: payload.progress === 100 ? DUMB_FEED : parser.tx(payload),
                          progress: payload.progress,
                        };
                      });
                    } else {
                      setForm(x => {
                        return {
                          ...x,
                          feed: DUMB_FEED,
                          progress: 0,
                          transmit: false,
                        };
                      });
                    }
                  }
                },
                onReady: () => {
                  if (mounted.current) {
                    setForm(x => ({
                      ...x,
                      feed: DUMB_FEED,
                      progress: 0,
                      transmit: true,
                    }));
                  }
                },
                onClose: () => {
                  if (mounted.current) {
                    setForm(x => {
                      const feed = x.feed;
                      if (feed && feed.complete) {
                        return {
                          ...x,
                          feed: DUMB_FEED,
                          transmit: false,
                        };
                      } else if (feed && !feed.complete) {
                        return {
                          ...x,
                          messages: [
                            ...x.messages,
                            {
                              ...feed,
                              value: feed.value,
                              canceled: true,
                              complete: true,
                            },
                          ],
                          feed: DUMB_FEED,
                          transmit: false,
                        };
                      } else {
                        return {
                          ...x,
                          transmit: false,
                          ui: {
                            ...x.ui,
                            prepare: false,
                          },
                        };
                      }
                    });
                  }
                },
                onError: () => {
                  if (mounted.current) {
                    message.failure("收报模块", "连接错误");
                  }
                },
              });

              return form;
            });
          },
          onCancel: () => {
            return;
          },
        });
      });

      //请求重发所选报文
      mci.on("body:send", (dx, dy) => {
        const px = position(dx);
        const py = position(dy);
        const title = dx === dy ? `请求重发 ${py} ?` : `请求重发 ${px} 到 ${py} ?`;
        Modal.confirm({
          centered: true,
          maskClosable: false,
          title: title,
          okType: "danger",
          onOk: () => {
            setForm(x => {
              return { ...x, sendStatus: true, sendNumber: x.sendNumber + 1 };
            });
            setForm(form => {
              const command = `morse-tx -speed ${form.speed} -shortcut askToRepeatWords ${dx} ${
                dy - dx + 1
              }`;
              socket.current = exec(command, {
                onData: payload => {
                  if (payload.tag === "Error") {
                    message.failure("收报模块", payload.message);
                    return;
                  }
                  if (payload.tag === "TxResult") {
                    //将己方发送的内容，回显到feed格子里，以便观测发送进度
                    if (payload.progress !== 100) {
                      setForm(x => {
                        return {
                          ...x,
                          feed: payload.progress === 100 ? DUMB_FEED : parser.tx(payload),
                          progress: payload.progress,
                        };
                      });
                    } else {
                      setForm(x => {
                        return {
                          ...x,
                          feed: DUMB_FEED,
                          progress: 0,
                          transmit: false,
                        };
                      });
                    }
                  }
                },
                onReady: () => {
                  if (mounted.current) {
                    setForm(x => ({
                      ...x,
                      feed: DUMB_FEED,
                      progress: 0,
                      // transmit: true,
                    }));
                  }
                },
                onClose: () => {
                  // if (mounted.current) {
                  //   setForm(x => {
                  //     const feed = x.feed;
                  //     if (feed && feed.complete) {
                  //       return {
                  //         ...x,
                  //         feed: DUMB_FEED,
                  //         transmit: false,
                  //       };
                  //     } else if (feed && !feed.complete) {
                  //       return {
                  //         ...x,
                  //         messages: [
                  //           ...x.messages,
                  //           {
                  //             ...feed,
                  //             value: feed.value,
                  //             canceled: true,
                  //             complete: true,
                  //           },
                  //         ],
                  //         feed: DUMB_FEED,
                  //         transmit: false,
                  //       };
                  //     } else {
                  //       return {
                  //         ...x,
                  //         transmit: false,
                  //         ui: {
                  //           ...x.ui,
                  //           prepare: false,
                  //         },
                  //       };
                  //     }
                  //   });
                  // }
                },
                onError: () => {
                  if (mounted.current) {
                    message.failure("收报模块", "连接错误");
                  }
                },
              });

              return form;
            });
          },
          onCancel: () => {
            return;
          },
        });
      });
    },
    [socket, mounted, setForm]
  );

  const handleChange = useCallback(
    (role: "head" | "body", field: string, value: string) => {
      // let [mhead, mbody] = [{}, {}];
      setForm(x => {
        x[role][field] = {
          ...x[role][field],
          value: (value as string).toUpperCase(),
          // warn: true,
        };

        const head = x.head;
        const body = x.body;
        markWarn(head, body);
        return {
          ...x,
        };
      });
    },
    [setForm, markWarn]
  );

  return {
    handleReady,
    handleChange,
  };
};

// const showWarn()

export default useEditor;

import { Socket } from "net";
import { IForm, DUMB_FEED } from "./typing";
import exec from "services/exec";
import message from "misc/message";
import useMounted from "hooks/useMounted";
import { Dispatch, useCallback, SetStateAction, MutableRefObject, useEffect } from "react";
import useHighlight from "./useHighlight";
import { each } from "misc/telegram";
import parser from "services/parser";
import guid from "misc/guid";

const useSender = (
  socket: MutableRefObject<Socket | undefined>,
  setForm: Dispatch<SetStateAction<IForm>>
): {
  emit: (pauseAtPage: number) => void;
  chat: (text: string) => void;
  chatCmd: (text: string) => void;
} => {
  const mounted = useMounted();
  const highlight = useHighlight(setForm);

  const emit = useCallback(
    (pauseAtPage: number) => {
      setForm(x => {
        return { ...x, isStar: true, sendStatus: true, sendNumber: x.sendNumber + 1 };
      });
      setForm(form => {
        const cmd =
          form.type === "EX"
            ? `morse-tx -speed ${form.speed} -shortcut sendWholeMessage`
            : `morse-tx -speed ${form.speed} -shortcut sendPagesAndWait 0 ${pauseAtPage} head`;

        socket.current = exec(
          cmd,
          {
            onData: payload => {
              if (mounted.current) {
                if (payload.tag === "Error") {
                  message.failure("发报模块", payload.message);
                  return;
                }
                if (payload.tag === "TxResult") {
                  //将己方发送的电文，回显到feed格子里，以便观测发送进度
                  const nrCharsSent = payload.nrCharsSent;
                  const sentCnt = nrCharsSent ? parseInt(nrCharsSent) : 0;
                  // console.log("sentCnt:", sentCnt);
                  // console.log("payload:", payload);
                  highlight(payload.text, sentCnt, 0);
                  setForm(x => {
                    return {
                      ...x,
                      // feed: parser.tx(payload),
                      feed: payload.progress === 100 ? DUMB_FEED : parser.tx(payload),
                      progress: payload.progress,
                      transmit: payload.progress === 100 ? false : true,
                      isStar: payload.progress === 100 ? false : true,
                      ui: {
                        ...x.ui,
                        prepare: false,
                      },
                    };
                  });
                } else {
                  console.warn("Unhandled tx feed back data(sendWholeMessage):", payload);
                }
              }
            },
            onReady: () => {
              setForm(x => {
                each(x.head, (k, v) => {
                  v.state = v.state === "pass" ? "none" : v.state;
                });
                each(x.body, (k, v) => {
                  v.state = v.state === "pass" ? "none" : v.state;
                });
                return {
                  ...x,
                  feed: DUMB_FEED,
                  progress: 0,
                  transmit: true,
                  ui: {
                    ...x.ui,
                    prepare: true,
                    send: false,
                  },
                };
              });
            },
            onClose: () => {
              if (mounted.current) {
                console.log("TX (raw/chat) - closed!!!");
                setForm(x => {
                  return { ...x, isStar: false, sendstatus: false };
                });
                if (mounted.current) {
                  setForm(x => {
                    const feed = x.feed;
                    if (feed && feed.complete) {
                      return {
                        ...x,
                        feed: DUMB_FEED,
                        transmit: false,
                        sendStatus: true,
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
              }
            },
            onError: () => {
              if (mounted.current) {
                message.failure("发报模块(发送报文)", "连接错误");
              }
            },
          }
          // ,
          // cwForm.activeRadio.ip
        );

        return form;
      });
    },
    [socket, mounted, setForm, highlight]
  );

  const chat = useCallback(
    (text: string) => {
      setForm(form => {
        const sendText = text.replace("Ü", "@");
        // cwForm?.activeRadio?.ip &&
        // console.log(`morse-tx -speed ${form.speed} -raw ${sendText}`);
        if (!form.sendStatus || form.sendNumber === 0) {
          // 代码bug 会重复发送指令
          // setForm(x => {
          //   return { ...x, sendStatus: true, sendNumber: x.sendNumber + 1 };
          // });
          socket.current = exec(
            `morse-tx -speed ${form.speed} -raw ${sendText}`,
            // `morse-tx -speed send -raw ${sendText}`,
            {
              onData: payload => {
                if (mounted.current) {
                  // alert(1222);
                  if (payload.tag === "Error") {
                    message.failure("发报模块", payload.message);
                    return;
                  }

                  if (payload.tag === "TxResult") {
                    if (payload.progress === 100) {
                      console.log("chat messages", form.messages);
                    }
                    //将己方发送的短语，回显到feed格子里，以便观测发送进度
                    const nrCharsSent = payload.nrCharsSent;
                    const sentCnt = nrCharsSent ? parseInt(nrCharsSent) : 0;
                    highlight(payload.text, sentCnt, 0);
                    setForm(x => {
                      if (payload.progress === 100) {
                        // alert(1);
                        return {
                          ...x,
                          feed: DUMB_FEED,
                          progress: payload.progress,
                          transmit: false,
                          sendStatus: false,
                          sendNumber: x.sendNumber - 1,
                          ui: {
                            ...x.ui,
                            prepare: false,
                          },
                          // messages: [...x.messages, parser.tx(payload)],
                        };
                      } else {
                        return {
                          ...x,
                          feed: parser.tx(payload),
                          progress: payload.progress,
                          sendStatus: true,
                          transmit: true,
                          ui: {
                            ...x.ui,
                            prepare: false,
                          },
                        };
                      }
                    });
                  } else {
                    console.warn("Unhandled tx feed back data(raw/chat):", payload);
                  }
                }
              },
              onReady: () => {
                if (mounted.current) {
                  setForm(x => {
                    return {
                      ...x,
                      feed: DUMB_FEED,
                      progress: 0,
                      transmit: false,
                    };
                  });
                }
              },
              onClose: () => {
                console.log("TX (raw/chat) - closed!!!");
                setForm(x => {
                  return { ...x, sendstatus: false };
                });
                if (mounted.current) {
                  setForm(x => {
                    const feed = x.feed;
                    if (feed && feed.complete) {
                      return {
                        ...x,
                        feed: DUMB_FEED,
                        transmit: false,
                        sendStatus: true,
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
                  message.failure("发报模块(沟通记录)", "连接错误");
                }
                setForm(x => ({ ...x, transmit: false, ui: { ...x.ui, prepare: false } }));
              },
            }
            // ,
            // cwForm.activeRadio.ip
          );
        } else {
          setForm(x => {
            const len = x.messages.length;
            return {
              ...x,
              messages: [
                ...x.messages.slice(0, len),
                {
                  ...x.feed,
                  type: "tx",
                  uuid: guid(),
                  value: sendText,
                  complete: false,
                  sendStatus: true,
                },
              ],
              sendNumber: x.sendNumber + 1,
            };
          });
        }
        return {
          ...form,
          sendStatus: true,
          sendNumber: form.sendNumber + 1
        };
      });
    },
    [socket, mounted, setForm, highlight]
  );

  const chatCmd = useCallback(
    (text: string) => {
      setForm(form => {
        const sendText = text.replace("Ü", "@");
        // cwForm?.activeRadio?.ip &&
        console.log("sendText=", text);
        socket.current = exec(
          `morse-setup ${sendText}`,
          // `morse-tx -speed send -raw ${sendText}`,
          {
            onData: payload => {
              console.log("payload", payload);
              // alert(1222);
              if (mounted.current) {
                if (payload.tag === "Error") {
                  message.failure("发报模块", payload.message);
                  return;
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
                } else if (payload.tag === "SetupResult") {
                  // alert(3);
                  console.log("============tx/ready/useSender, return SetupResult:", payload);
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

                  payload.message && message.success("发报模块", payload.message);
                } else {
                  console.warn("Unhandled tx feed back data(raw/chat):", payload);
                }
              }
            },
            onReady: () => {
              if (mounted.current) {
                // setForm(x => {
                //   return {
                //     ...x,
                //     feed: DUMB_FEED,
                //     progress: 0,
                //     transmit: true,
                //   };
                // });
              }
            },
            onClose: () => {
              console.log("TX (raw/chat) - closed!!!");
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
                message.failure("发报模块(发报设置)", "连接错误");
              }
            },
          }
          // ,
          // cwForm.activeRadio.ip
        );

        return form;
      });
    },
    [socket, setForm, mounted]
  );

  // chat("111",cwForm);
  useEffect(() => {
    setForm(form => {
      socket.current = exec(
        `morse-tx -speed ${form.speed} -raw ready`,
        // `morse-tx -speed send -raw ${sendText}`,
        {
          onData: payload => {
            if (mounted.current) {
              if (payload.tag === "Error") {
                message.failure("发报模块", payload.message);
                return;
              }
              if (payload.tag === "TxResult") {
                console.log("TX (raw/chat) - useSender!!!");
                if (payload.progress === 100) {
                }
                //将己方发送的短语，回显到feed格子里，以便观测发送进度
                const nrCharsSent = payload.nrCharsSent;
                const sentCnt = nrCharsSent ? parseInt(nrCharsSent) : 0;
                highlight(payload.text, sentCnt, 0);
                setForm(x => {
                  if (payload.progress === 100) {
                    return {
                      ...x,
                      feed: DUMB_FEED,
                      progress: payload.progress,
                      transmit: true,
                    };
                  } else {
                    return {
                      ...x,
                      feed: parser.tx(payload),
                      transmit: true,
                      progress: payload.progress,
                      ui: {
                        ...x.ui,
                        prepare: false,
                      },
                    };
                  }
                });
              } else {
                console.warn("Unhandled tx feed back data(raw/chat):", payload);
              }
            }
          },
          onReady: () => {
            if (mounted.current) {
              setForm(x => {
                return {
                  ...x,
                  feed: DUMB_FEED,
                  progress: 0,
                  transmit: false,
                };
              });
            }
          },
          onClose: () => {
            console.log("TX (raw/chat) - closed!!!");
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
                    feed: DUMB_FEED,
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
              message.failure("发报模块", "连接错误");
            }
          },
        }
        // ,
        // cwForm.activeRadio.ip
      );
      return form;
    });
    setForm(x => ({
      ...x,
      feed: DUMB_FEED,
      transmit: false,
      ui: {
        ...x.ui,
        prepare: false,
      },
    }));
    //eslint-disable-next-line
  }, []);
  return {
    chat,
    emit,
    chatCmd,
  };
};

export default useSender;

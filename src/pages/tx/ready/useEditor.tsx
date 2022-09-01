import { Socket } from "net";
import { IForm, DUMB_FEED } from "./typing";
import exec from "services/exec";
import message from "misc/message";
import isEmpty from "lodash/isEmpty";
import useMounted from "hooks/useMounted";
import { position } from "misc/telegram";
import { MceInstance } from "mce/typing";
import { Modal } from "antd";
import { Dispatch, useCallback, SetStateAction, MutableRefObject } from "react";
import useHighlight from "./useHighlight";
import { each } from "misc/telegram";
import parser from "services/parser";

const useEditor = (
  socket: MutableRefObject<Socket | undefined>,
  setForm: Dispatch<SetStateAction<IForm>>
): {
  handleReady: (mci: MceInstance) => void;
  handleMarkSendBody: (repeat: boolean, index: number, page: number, count: number) => void;
  handleMarkSendHead: (repeat: boolean) => void;
} => {
  const mounted = useMounted();
  const highlight = useHighlight(setForm);

  const handleReady = useCallback(
    (mci: MceInstance) => {
      // 单击报头
      mci.on("head:click", (_, field) => {
        setForm(it => {
          const item = it.head[field];
          if (item) {
            return {
              ...it,
              code: item.value,
            };
          }
          return it;
        });
      });
      mci.on("head:contextMenu", (_, field) => {
        setForm(it => {
          const item = it.head[field];
          if (item) {
            return {
              ...it,
              code: item.value,
            };
          }
          return it;
        });
      });

      // 单击报文
      mci.on("body:click", (_, field) => {
        setForm(it => {
          return it;
        });
      });
      mci.on("body:contextMenu", (_, field) => {
        setForm(it => {
          return it;
        });
      });

      mci.on("head:mark", () => {
        setForm(form => {
          return {
            ...form,
            ui: {
              ...form.ui,
              send: true,
            },
            send: {
              ...form.send,
              role: "head",
            },
          };
        });
      });

      // 重发所选报头
      mci.on("head:send", index => {
        const mapper: {
          [x: string]: string | undefined;
        } = {
          NR: "repeatHeadFieldNr",
          CK: "repeatHeadFieldCk",
          CLS: "repeatHeadFieldCls",
          DATE: "repeatHeadFieldDate",
          TIME: "repeatHeadFieldTime",
          RMKS: "repeatHeadFieldRmks",
          PBL: "repeatHeadFieldAll",
          PBLNEW: "repeatHeadFieldAllNEW",
        };

        if (isEmpty(mapper[index])) {
          return;
        }
        Modal.confirm({
          centered: true,
          title: `${
            index === "PBLNEW" ? "发送完整报头" : `重发${index === "PBL" ? "完整" : "所选"}报头 `
          } ${index === "PBLNEW" || index === "PBL" ? "" : index} ？`,
          okType: "danger",
          maskClosable: false,
          onOk: () => {
            setForm(x => {
              return { ...x, sendStatus: true, sendNumber: x.sendNumber + 1 };
            });
            setForm(form => {
              socket.current = exec(`morse-tx -speed ${form.speed} -shortcut ${mapper[index]}`, {
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
                      highlight(payload.text, sentCnt, 0);
                      if (payload.progress !== 100) {
                        setForm(x => {
                          return {
                            ...x,
                            feed: parser.tx(payload),
                            progress: payload.progress,
                            transmit: true,
                            ui: {
                              ...x.ui,
                              prepare: false,
                            },
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
                  }
                },
                onReady: () => {
                  setForm(x => {
                    each(x.head, (k, v) => {
                      v.state = v.state === "pass" ? "none" : v.state;
                    });
                    return {
                      ...x,
                      feed: DUMB_FEED,
                      progress: 0,
                      transmit: true,
                    };
                  });
                },
                onClose: () => {
                  if (mounted.current) {
                    setForm(x => {
                      const feed = x.feed;
                      if (feed && feed.complete) {
                        return {
                          ...x,
                          messages: [...x.messages, feed],
                          feed: DUMB_FEED,
                          transmit: false,
                          ui: {
                            ...x.ui,
                            prepare: false,
                          },
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
                          ui: {
                            ...x.ui,
                            prepare: false,
                          },
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
                    message.failure("发报模块(重发报头)", "连接错误");
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

      // 从此开始发送body
      mci.on("body:mark", index => {
        // alert(1);
        setForm(form => {
          const page = Math.ceil((index + 1) / 100);
          const repeat = index % 100 !== 0;
          return {
            ...form,
            ui: {
              ...form.ui,
              send: true,
            },
            send: {
              ...form.send,
              role: "body",
              dx: index,
              dy: index,
              repeat: repeat,
              continuous: true,
              page: page,
              whole: false,
            },
          };
        });
      });

      // 重发所选报文
      mci.on("body:send", (dx, dy) => {
        const x = dx < 0 ? 0 : dx;
        const y = dy < 0 ? 0 : dy;
        const px = position(x);
        const py = position(y);
        const title = x === y ? `重发 ${py} ?` : `重发 ${px} 到 ${py} ?`;

        Modal.confirm({
          centered: true,
          title: title,
          okType: "danger",
          maskClosable: false,
          onOk: () => {
            setForm(x => {
              return { ...x, sendStatus: true, sendNumber: x.sendNumber + 1 };
            });
            setForm(form => {
              socket.current = exec(
                `morse-tx -speed ${form.speed} -shortcut repeatWords ${x} ${y - x + 1}`,
                {
                  onData: payload => {
                    if (mounted.current) {
                      if (payload.tag === "Error") {
                        message.failure("发报模块", payload.message);
                        return;
                      }
                      if (payload.tag === "TxResult") {
                        //将己方发送的内容，回显到feed格子里，以便观测发送进度
                        const nrCharsSent = payload.nrCharsSent;
                        const sentCnt = nrCharsSent ? parseInt(nrCharsSent) : 0;
                        highlight(payload.text, sentCnt, x);
                        setForm(f => {
                          if (payload.progress === 100) {
                            each(form.body, (k, v) => {
                              if (parseInt(k) >= x && parseInt(k) <= y) {
                                v.state = "pass";
                              }
                            });
                            return {
                              ...f,
                              feed: DUMB_FEED,
                              progress: payload.progress,
                              transmit: false,
                              sendStatus: true,
                            };
                          } else {
                            return {
                              ...f,
                              feed: parser.tx(payload),
                              progress: payload.progress,
                              ui: {
                                ...f.ui,
                                prepare: false,
                              },
                            };
                          }
                        });
                      }
                    }
                  },
                  onReady: () => {
                    setForm(form => {
                      each(form.body, (k, v) => {
                        if (parseInt(k) >= x && parseInt(k) <= y) {
                          v.state = v.state === "pass" ? "active" : v.state;
                        }
                      });
                      return {
                        ...form,
                        feed: DUMB_FEED,
                        progress: 0,
                        transmit: true,
                        ui: {
                          ...form.ui,
                          prepare: true,
                        },
                      };
                    });
                  },
                  onClose: () => {
                    // console.log("TX useEditor, repeatWords, socket closed...");
                    if (mounted.current) {
                      setForm(x => {
                        const feed = x.feed;
                        if (feed && feed.complete) {
                          return {
                            ...x,
                            feed: DUMB_FEED,
                            transmit: false,
                            ui: {
                              ...x.ui,
                              prepare: false,
                            },
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
                            ui: {
                              ...x.ui,
                              prepare: false,
                            },
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
                      message.failure("发报模块(重发选定报文)", "连接错误");
                    }
                  },
                }
              );

              return form;
            });
          },
          onCancel: () => {
            return;
          },
        });
      });
    },
    [socket, mounted, highlight, setForm]
  );

  const handleMarkSendBody = useCallback(
    async (repeat: boolean, index: number, page: number, count: number) => {
      setForm(x => {
        return { ...x, isStar: true, sendStatus: true, sendNumber: x.sendNumber + 1 };
      });
      setForm(form => {
        let cmd = `morse-tx -speed ${form.speed} -shortcut repeatFromOffset ${index}`;
        if (!repeat) {
          if (index % 100 !== 0) {
            cmd = `morse-tx -speed ${form.speed} -shortcut sendFromOffset ${index}`;
          } else {
            cmd = `morse-tx -speed ${form.speed} -shortcut sendPagesAndWait ${page - 1} ${count}`;
          }
        }
        socket.current = exec(cmd, {
          onData: payload => {
            if (mounted.current) {
              if (payload.tag === "Error") {
                message.failure("发报模块", payload.message);
                return;
              }
              if (payload.tag === "TxResult") {
                const nrCharsSent = payload.nrCharsSent;
                const sentCnt = nrCharsSent ? parseInt(nrCharsSent) : 0;
                highlight(payload.text, sentCnt, index);
                if (payload.progress !== 100) {
                  setForm(x => {
                    return {
                      ...x,
                      feed: parser.tx(payload),
                      progress: payload.progress,
                      ui: {
                        ...x.ui,
                        prepare: false,
                        send: false,
                      },
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
              } else {
                console.warn("Unhandled tx feed back data(handleMarkSendBody):", payload);
              }
            }
          },
          onReady: () => {
            setForm(x => {
              each(x.body, (k, v) => {
                if (parseInt(k) >= index) {
                  v.state = v.state === "pass" ? "none" : v.state;
                }
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
                send: {
                  ...x.send,
                  whole: false,
                },
              };
            });
          },
          onClose: () => {
            // console.log("handleMarkSendBody - closed!!!");
            if (mounted.current) {
              setForm(x => {
                const feed = x.feed;
                if (feed.complete) {
                  return {
                    ...x,
                    messages: [...x.messages, feed],
                    feed: DUMB_FEED,
                    transmit: false,
                    ui: {
                      ...x.ui,
                      prepare: false,
                      send: false,
                    },
                  };
                } else {
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
                    ui: {
                      ...x.ui,
                      prepare: false,
                      send: false,
                    },
                  };
                }
              });
            }
          },
          onError: () => {
            if (mounted.current) {
              message.failure("发报模块(指定位置重发)", "连接错误");
            }
          },
        });

        return form;
      });
    },
    [socket, mounted, highlight, setForm]
  );

  const handleMarkSendHead = useCallback(
    async (repeat: boolean) => {
      setForm(x => {
        return { ...x, isStar: true, sendStatus: true, sendNumber: x.sendNumber + 1 };
      });
      setForm(form => {
        let cmd = `morse-tx -speed ${form.speed} -shortcut repeatHead`;
        if (!repeat) {
          cmd = `morse-tx -speed ${form.speed} -shortcut sendHead`;
        }
        socket.current = exec(cmd, {
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
                highlight(payload.text, sentCnt, 0);
                setForm(x => {
                  return {
                    ...x,
                    feed: parser.tx(payload),
                    progress: payload.progress,
                    ui: {
                      ...x.ui,
                      prepare: false,
                      send: false,
                    },
                  };
                });
              }
            }
          },
          onReady: () => {
            setForm(x => {
              each(x.head, (k, v) => {
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
              setForm(x => {
                const feed = x.feed;
                if (feed && feed.complete) {
                  return {
                    ...x,
                    messages: [...x.messages, feed],
                    feed: DUMB_FEED,
                    transmit: false,
                    ui: {
                      ...x.ui,
                      prepare: false,
                    },
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
                    ui: {
                      ...x.ui,
                      prepare: false,
                    },
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
              message.failure("发报模块(重发指定报头)", "连接错误");
            }
          },
        });

        return form;
      });
    },
    //eslint-disable-next-line
    [socket, mounted, highlight]
  );
  return {
    handleReady,
    handleMarkSendBody,
    handleMarkSendHead,
  };
};

export default useEditor;

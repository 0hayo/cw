import { Socket } from "net";
import { setter, DUMB_FEED } from "../typing";
import exec from "services/exec";
import message from "misc/message";
import useMounted from "hooks/useMounted";
import { useCallback, MutableRefObject, useEffect } from "react";
import parser from "services/parser";
import cwIForm from "pages/cw/form";
import guid from "misc/guid";

const useSender = (
  socket: MutableRefObject<Socket | undefined>,
  setForm: setter
): {
  chat: (text: string, cwForm?: cwIForm) => void;
  chatCmd: (text: string, cwForm?: cwIForm) => void;
} => {
  const mounted = useMounted();

  const chat = useCallback(
    (text: string, cwForm?: cwIForm) => {
      setForm(form => {
        const sendText = text.replace("Ü", "@");
        if (!form.sendStatus || form.sendNumber === 0) {
          if (socket.current) {
            socket.current.end();
          }
          setForm(x => {
            return { ...x, sendStatus: true, sendNumber: x.sendNumber + 1 };
          });

          // cwForm.activeRadio?.ip &&
          socket.current = exec(
            // `{"cmd":"ctConnect","radioCode":"10001"} \r\n morse-tx -speed ${form.speed} -raw ${sendText}`,
            `morse-tx -speed ${form.speed} -raw ${sendText}`,
            // `morse-tx -speed recv -raw ${sendText}`,
            {
              onData: payload => {
                console.log("RX Sender, xxxxx:", JSON.stringify(payload));
                if (mounted.current) {
                  if (payload.tag === "Error") {
                    message.failure("收报模块", payload.message);
                    return;
                  }
                  if (payload.tag === "TxResult") {
                    //将己方发送的短语，回显到feed格子里，以便观测发送进度
                    console.log("RX Sender, TxResult:", JSON.stringify(payload));
                    // {"tag":"PhyStatus","snr":11.567533596135995,"amp":13474.69349189458,"freq":997.0654564322592,"signalDetected":false,"snrThreshold":2.0,"ampThreshold":50000.0}
                    // {"tag":"TxResult","timestamp":1620446031941,"text":"VVV 1234 DE 5678 K?","speed":80,"storage":{"tag":"AudioDataStorage","fileName":"/home/mst/.morsed/session/SZT-MAT-0000-20210508-115337-TX/tx.raw","offset":0,"length":258048},"rc":0,"progress":100,"nrCharsSent":19}

                    const message = parser.tx(payload);
                    if (payload.progress === 100) {
                      // alert(100);
                      // alert(tmpNUm);
                      setForm(it => ({
                        ...it,
                        feed: payload.progress === 100 ? DUMB_FEED : message,
                        progress: payload.progress,
                        transmit: payload.progress === 100 ? false : true,
                        isStar: payload.progress === 100 ? false : true,
                        sendStatus: true,
                        sendNumber: it.sendNumber - 1,
                      }));
                    } else {
                      setForm(it => ({
                        ...it,
                        feed: payload.progress === 100 ? DUMB_FEED : message,
                        progress: payload.progress,
                        transmit: payload.progress === 100 ? false : true,
                        isStar: payload.progress === 100 ? false : true,
                        sendStatus: payload.progress === 100 ? false : true,
                        // sendNumber: -1,
                      }));
                    }
                  } else {
                    setForm(x => ({
                      ...x,
                      feed: DUMB_FEED,
                      progress: 0,
                      transmit: false,
                      sendStatus: false,
                      sendNumber: x.sendNumber - 1,
                    }));
                  }
                }
              },
              onReady: () => {
                if (mounted.current) {
                  // setForm(x => ({
                  //   ...x,
                  //   feed: DUMB_FEED,
                  //   progress: 0,
                  //   transmit: false,
                  // }));
                }
              },
              onClose: () => {
                if (mounted.current) {
                  // Modal.confirm({
                  //   okType: "danger",
                  //   centered: true,
                  //   maskClosable: true,
                  //   title: "网络异常提醒",
                  //   content:
                  //     "和业务服务器的网络连接已经断开，需要您重新刷新进入工作界面！如不需要则点取消按钮！",
                  //   onOk: async () => {
                  //     try {
                  //       // history.push("/tx?silent=1");
                  //       // eslint-disable-next-line no-restricted-globals
                  //       // history.push("/telegram");
                  //       window.location.reload();
                  //     } catch (ex) {
                  //       message.failure("发生错误", ex.message || ex.toString());
                  //     }
                  //   },
                  // });
                  // setForm(x => {
                  //   const feed = x.feed;
                  //   if (feed && feed.complete) {
                  //     return {
                  //       ...x,
                  //       feed: DUMB_FEED,
                  //       transmit: false,
                  //     };
                  //   } else if (feed && !feed.complete) {
                  //     return {
                  //       ...x,
                  //       messages: [
                  //         ...x.messages,
                  //         {
                  //           ...feed,
                  //           value: feed.value,
                  //           canceled: true,
                  //           complete: true,
                  //         },
                  //       ],
                  //       feed: DUMB_FEED,
                  //       transmit: false,
                  //     };
                  //   } else {
                  //     return {
                  //       ...x,
                  //       transmit: false,
                  //       ui: {
                  //         ...x.ui,
                  //         prepare: false,
                  //       },
                  //     };
                  //   }
                  // });
                }
              },
              onError: () => {
                if (mounted.current) {
                  message.failure("收报模块", "连接错误");
                }
              },
            }

            // ,
            // cwForm?.activeRadio?.ip
          );
          // setForm(x => {
          //   const len = x.messages.length;
          //   return {
          //     ...x,
          //     sendNumber: x.sendNumber - 1,
          //   };
          // });
        } else {
          setForm(x => {
            const len = x.messages.length;
            return {
              ...x,
              // sendStatus: false,
              messages: [
                ...x.messages.slice(0, len),
                {
                  ...x.feed,
                  type: "tx",
                  uuid: guid(),
                  value: sendText.toUpperCase(),
                  complete: false,
                  sendStatus: true,
                },
              ],
              sendNumber: x.sendNumber + 1,
            };
          });
        }

        return form;
      });
    },
    [socket, mounted, setForm]
  );
  const chatCmd = useCallback(
    (text: string, cwForm?: cwIForm) => {
      setForm(form => {
        // if (socket.current) {
        //   socket.current.end();
        // }
        const sendText = text.replace("Ü", "@");
        // cwForm.activeRadio?.ip &&
        socket.current = exec(
          // `{"cmd":"ctConnect","radioCode":"10001"} \r\n morse-tx -speed ${form.speed} -raw ${sendText}`,
          // `morse-tx -speed ${form.speed} -raw ${sendText}`,
          `morse-setup ${sendText}`,
          // `morse-tx -speed recv -raw ${sendText}`,
          {
            onData: payload => {
              // if (mounted.current) {
              //   if (payload.tag === "Error") {
              //     message.failure("收报模块", payload.message);
              //     return;
              //   }
              //   if (payload.tag === "TxResult") {
              //     //将己方发送的短语，回显到feed格子里，以便观测发送进度
              //     console.log("RX Sender, TxResult:", JSON.stringify(payload));
              //     // {"tag":"PhyStatus","snr":11.567533596135995,"amp":13474.69349189458,"freq":997.0654564322592,"signalDetected":false,"snrThreshold":2.0,"ampThreshold":50000.0}
              //     // {"tag":"TxResult","timestamp":1620446031941,"text":"VVV 1234 DE 5678 K?","speed":80,"storage":{"tag":"AudioDataStorage","fileName":"/home/mst/.morsed/session/SZT-MAT-0000-20210508-115337-TX/tx.raw","offset":0,"length":258048},"rc":0,"progress":100,"nrCharsSent":19}
              //
              //     const message = parser.tx(payload);
              //     setForm(it => (
              //         {
              //           ...it,
              //           feed: payload.progress === 100 ? DUMB_FEED : message,
              //           progress: payload.progress,
              //           transmit: payload.progress === 100 ? false : true,
              //
              //         }
              //     ));
              //   } else {
              //   }
              // }
            },
            onReady: () => {
              if (mounted.current) {
                // setForm(x => ({
                //   ...x,
                //   feed: DUMB_FEED,
                //   progress: 0,
                //   transmit: true,
                // }));
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
          }
          // ,
          // cwForm?.activeRadio?.ip
        );

        return form;
      });
    },
    [socket, mounted, setForm]
  );

  useEffect(() => {
    setForm(form => {
      socket.current = exec(
        // `{"cmd":"ctConnect","radioCode":"10001"} \r\n morse-tx -speed ${form.speed} -raw ${sendText}`,
        `morse-tx -speed ${form.speed} -raw ready`,
        // `morse-tx -speed recv -raw ${sendText}`,
        {
          onData: payload => {
            if (mounted.current) {
              if (payload.tag === "Error") {
                message.failure("收报模块", payload.message);
                return;
              }
              if (payload.tag === "TxResult") {
                // console.log("RX Sender, TxResult:", JSON.stringify(payload));
                // {"tag":"PhyStatus","snr":11.567533596135995,"amp":13474.69349189458,"freq":997.0654564322592,"signalDetected":false,"snrThreshold":2.0,"ampThreshold":50000.0}
                // {"tag":"TxResult","timestamp":1620446031941,"text":"VVV 1234 DE 5678 K?","speed":80,"storage":{"tag":"AudioDataStorage","fileName":"/home/mst/.morsed/session/SZT-MAT-0000-20210508-115337-TX/tx.raw","offset":0,"length":258048},"rc":0,"progress":100,"nrCharsSent":19}

                const message = parser.tx(payload);
                setForm(it => ({
                  ...it,
                  feed: payload.progress === 100 ? DUMB_FEED : message,
                  progress: payload.progress,
                  transmit: payload.progress === 100 ? false : true,
                }));
              } else {
                // setForm(x => ({
                //   ...x,
                //   feed: DUMB_FEED,
                //   progress: 0,
                //   transmit: false,
                // }));
              }
            }
          },
          onReady: () => {
            if (mounted.current) {
              // setForm(x => ({
              //   ...x,
              //   feed: DUMB_FEED,
              //   progress: 0,
              //   transmit: false,
              // }));
            }
          },
          onClose: () => {
            if (mounted.current) {
              // setForm(x => {
              //   const feed = x.feed;
              //   if (feed && feed.complete) {
              //     return {
              //       ...x,
              //       feed: DUMB_FEED,
              //       transmit: false,
              //     };
              //   } else if (feed && !feed.complete) {
              //     return {
              //       ...x,
              //       messages: [
              //         ...x.messages,
              //         {
              //           ...feed,
              //           value: feed.value,
              //           canceled: true,
              //           complete: true,
              //         },
              //       ],
              //       feed: DUMB_FEED,
              //       transmit: false,
              //     };
              //   } else {
              //     return {
              //       ...x,
              //       transmit: false,
              //       ui: {
              //         ...x.ui,
              //         prepare: false,
              //       },
              //     };
              //   }
              // });
            }
          },
          onError: () => {
            if (mounted.current) {
              message.failure("收报模块", "连接错误");
            }
          },
        }
        // ,
        // cwForm?.activeRadio?.ip
      );
      return form;
    });
  }, [mounted, socket, setForm]);

  return {
    chat,
    chatCmd,
  };
};

export default useSender;

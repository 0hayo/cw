import { Socket } from "net";
import exec from "services/exec";
import { IForm, DUMB_FEED } from "../typing";
import messenger from "misc/message";
import parser from "services/parser";
import { max, each, empty } from "misc/telegram";
import useMounted from "hooks/useMounted";
import { useEffect, Dispatch, SetStateAction, useRef, useMemo } from "react";
import { workingMode } from "misc/env";
import useWarn from "../useWarn";
import cwIForm from "pages/cw/form";
import useRegular from "./useRegular";
import useSave from "../useSave";
// import { Modal } from "antd";
// import message from "misc/message";
import { useLocation } from "react-router";
import qs from "query-string";
import message from "misc/message";

const useReceive = (setForm: Dispatch<SetStateAction<IForm>>, cwForm?: cwIForm, form?: IForm) => {
  const socket = useRef<Socket>();
  const mounted = useMounted();
  const markWarn = useWarn(setForm);
  const regular = useRegular(setForm);
  const save = useSave(setForm);
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const type = search.type as TelegramBizType;

  useEffect(() => {
    // setForm(x => ({ ...x, autoFlag: 0 }));
    (async () => {
      try {
        // alert("111"+type);
        let cmd = `session -rx -speed ${form.speed} -${workingMode} ${type || "CCK"
          } -profile machine`;
        //检查是否有session(需要同步处理)
        await setForm(form => {
          const session = form.session;
          if (session && session.exists) {
            cmd = `session -load ${session.path} -speed 80 -${workingMode} ${form.type}`;
          }
          return {
            ...form,
            type: type,
          };
        });

        socket.current = exec(
          cmd,
          {
            onData: payload => {
              if (mounted.current) {
                // Error
                if (payload.tag === "Error") {
                  messenger.failure("收报模块", payload.message);
                  return;
                }
                if (payload.tag === "Result") {
                  if (payload.types === "print") {
                    message.success("收报完成", "报文已抄收完毕并完成自动校对。", true);
                    setForm(x => {
                      const  obj: IForm = {
                        ...x,
                        state: "check",
                        regular: {
                          head: { ...x.head },
                          body: { ...x.body },
                          page: x.page,
                          size: x.size,
                          offset: 0,
                          role: "head",
                        },
                      }
                      save(obj, () => { }, cwForm);
                      message.success("保存完成", "报文已自动保存。", true);
                      return obj;
                    });
                    // setForm(x => {
                    //   // console.log("before", x["head"]["CLS"]);
                    //   // let grade1 = "加急";
                    //   // if (x["head"]["CLS"].value === "01") {
                    //   //   grade1 = "急报";
                    //   // } else if (x["head"]["CLS"].value === "02") {
                    //   //   grade1 = "加急";
                    //   // } else if (x["head"]["CLS"].value === "03") {
                    //   //   grade1 = "特急";
                    //   // }
                    //   // const grade2 = grade1;
                    //   //
                    //   // x["head"]["CLS"] = {
                    //   //   ...x["head"]["CLS"],
                    //   //   value: grade2,
                    //   //   crude: x["head"]["CLS"].value,
                    //   //   light: true,
                    //   //   // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
                    //   // };
                    //   return {
                    //     ...x,
                    //     print: false, //750需求，收报完成后，不打印
                    //     save: true, //750需求，收报完成后，弹出保存对话框
                    //   };
                    // });
                    // alert(form.type);
                    // setForm(x => ({
                    //   ...x,
                    //   // type: type,
                    //   ui: {
                    //     ...x.ui,
                    //     // print: true,
                    //     print: false, //750需求，收报完成后，不打印
                    //     save: true, //750需求，收报完成后，弹出保存对话框
                    //     warn: true,
                    //   },
                    // }));
                    // regular.cover();
                    // regular.goto();
                    // setTimeout(() => {
                    //   console.log(11111111,form)
                    //   save(form, () => { }, cwForm);
                    //   message.success("保存完成", "报文已自动保存。", true);
                    // }, 1000);
                  } else if (payload.types === "1004") {
                    setForm(x => ({
                      ...x,
                      // qsyShow: true,
                      errorShow: true,
                      qsyMsg: payload.values.NR.text,
                    }));
                  } else if (payload.types === "1005") {
                    setForm(x => ({
                      ...x,
                      qsyShow: false,
                      errorShow: false,
                    }));
                  } else {
                    let title = "";
                    // let sendString = "";
                    if (payload.types === "1001") {
                      title =
                        // "呼号系统自动验证失败，请人工查验，是否继续？确定则自动回复信号强度，取消则人工操作！";
                        "呼号系统自动验证失败，终止自动作业，请人工干预！";
                      const titleConst = title;
                      // sendString = "R QSA3 QSA? K";
                      setForm(x => ({
                        ...x,
                        errorShow: true,
                        qsyMsg: titleConst,
                        sendString: "",
                        autoFlag: 0,
                      }));
                    } else if (payload.types === "1002") {
                      title = "暗令校验失败，终止自动作业，请人工干预！";
                      const titleConst = title;
                      // sendString = "R QSA3 QSA? K";
                      setForm(x => ({
                        ...x,
                        errorShow: true,
                        qsyMsg: titleConst,
                        sendString: "",
                        autoFlag: 0,
                      }));
                    }
                    // alert(payload.types);

                    // Modal.confirm({
                    //   okType: "danger",
                    //   centered: true,
                    //   maskClosable: true,
                    //   title: "验证不正确提醒！",
                    //   content: titleConst,
                    //   onOk: async () => {
                    //     try {
                    //       // history.push("/tx?silent=1");
                    //       // eslint-disable-next-line no-restricted-globals
                    //       // history.push("/telegram");
                    //       // window.location.reload();
                    //       if (payload.types === "1001") {
                    //         setForm(x => ({
                    //           ...x,
                    //           sendStatus: false,
                    //         }));
                    //         sendMessage(sendString);
                    //       }
                    //     } catch (ex) {
                    //       message.failure("发生错误", ex.message || ex.toString());
                    //     }
                    //   },
                    //   onCancel: async () => {
                    //     setForm(x => ({
                    //       ...x,
                    //       autoFlag: 0,
                    //     }));
                    //     message.success("自动作业已经取消，请注意！");
                    //   },
                    // });
                  }
                  // setTimeout(() => {
                  //   setForm(x => ({
                  //     ...x,
                  //     type: "CCK",
                  //     ui: {
                  //       ...x.ui,
                  //       print: true,
                  //       warn: true,
                  //     },
                  //   }));
                  // }, 2000);
                }
                if (payload.tag === "RptResult") {
                  // messenger.success("收报完成", payload.tag);
                  if (payload.types === "body") {
                    const values = payload.values;
                    const keys = Object.keys(values);
                    keys.forEach(k => {
                      setForm(x => {
                        console.log("before", x["body"][k + ""]);
                        // x["body"][k + ""] = {
                        //   ...x["body"][k + ""],
                        //   value: values[k].text,
                        //   crude: x["body"][k].value,
                        //   light: true,
                        //   // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
                        // };
                        x["body"][k + ""] = {
                          ...x["body"][k + ""],
                          value: values[k].text,
                          crude: x["body"][k].crude,
                          light: true,
                          // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
                        };
                        console.log("after", x["body"][k + ""]);
                        const head = x.head;
                        const body = x.body;
                        markWarn(head, body);
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
                  } else if (payload.types === "head") {
                    const values = payload.values;
                    const keys = Object.keys(values);
                    keys.forEach(k => {
                      setForm(x => {
                        console.log("before", x["head"][k + ""]);
                        let crude1 = x["head"][k] ? x["head"][k].value : "";
                        if (k === "SIGN") {
                          crude1 = values[k].text;
                        }
                        const crude = crude1;
                        x["head"][k + ""] = {
                          ...x["head"][k + ""],
                          value: values[k].text,
                          crude: crude,
                          light: true,
                          // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
                        };
                        console.log("after", x["head"][k + ""]);
                        const head = x.head;
                        const body = x.body;
                        markWarn(head, body);
                        return {
                          ...x,
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

                  // setForm(x => {
                  //   x["body"]["2"] = {
                  //     ...x["body"]["2"],
                  //     value: ("9966").toUpperCase(),
                  //     warn: true,
                  //   };
                  //
                  //   const head = x.head;
                  //   const body = x.body;
                  //   markWarn(head, body);
                  //   return {
                  //     ...x,
                  //   };
                  // });
                  return;
                }
                // MorseSession
                else if (payload.tag === "MorseSession") {
                  console.log("MorseSession=", JSON.stringify(payload));
                  setForm(it => ({
                    ...it,
                    session: {
                      path: payload.dir,
                      name: payload.name,
                      file: payload.rxFile,
                    },
                    phystatus: true,
                  }));
                  messenger.success("收报模块", "初始化连接成功");
                }
                // TxResult
                else if (payload.tag === "TxResult") {
                  console.log("RX useReceive TxResult:", JSON.stringify(payload));
                  const message = parser.tx(payload);
                  console.log("messsage=", message);
                  if (message.complete) {
                    setForm(it => {
                      const warn = markWarn(it.head, it.body);
                      return {
                        ...it,
                        feedRx: payload.progress === 100 ? DUMB_FEED : message,
                        messages: [...it.messages, parser.tx(payload)],
                        progress: payload.progress,
                        transmit: false,
                        ui: {
                          ...it.ui,
                          warn,
                        },
                      };
                    });
                  } else {
                    setForm(it => ({
                      ...it,
                      feed: payload.progress === 100 ? DUMB_FEED : message,
                      progress: payload.progress,
                      transmit: payload.progress === 100 ? false : true,
                      sendStatus: payload.progress === 100 ? false : true,
                      // sendNumber: -1,
                    }));
                  }
                }
                // RxResult
                else if (payload.tag === "RxResult") {
                  console.log("RX Receive, RxResult:", payload.complete);
                  // if (!payload.complete) {
                  setForm(it => {
                    if (payload.telegram) {
                      const body = parser.body(payload);
                      // console.log("body", body);
                      // alert(it.type);
                      const head = parser.head(payload, it.type);
                      if (!empty(head)) {
                        each(head, (k, v) => {
                          if (it.head[k] && v.value !== it.head[k]?.value) {
                            // const originvalue = it.head[k]?.value;
                            it.head[k] = {
                              ...head[k],
                              crude: v.crude,
                              // crude: "111",
                              value: v.value,
                            };
                          } else {
                            it.head[k] = v;
                            // it.head[k] = {
                            //   ...head[k],
                            //   crude: v.crude,
                            //   // crude: "111",
                            //   value: v.value,
                            // };
                          }
                        });
                      }
                      if (!empty(body)) {
                        // let numTotal = 0;
                        it.body = {};
                        each(body, (k, v) => {
                          if (it.body[k] && v.value !== it.body[k]?.value) {
                            const originvalue = it.body[k]?.value;
                            it.body[k] = {
                              ...body[k],
                              crude: originvalue,
                              // crude: "0000",
                              value: v.value,
                            };
                          } else {
                            it.body[k] = v;
                          }
                          // numTotal++;
                        });
                      }
                      // markWarn(head, body);
                      //
                      if (payload.complete) {
                        const hint: Array<{
                          label: string;
                          value: string;
                        }> = [];
                        markWarn(it.head, it.body);
                        if (payload.parsed && payload.parsed.hints && payload.parsed.suggestions) {
                          const labels: string[] = payload.parsed.hints;
                          const values: string[] = payload.parsed.suggestions;
                          labels.forEach((_, ix) => {
                            hint.push({
                              label: labels[ix],
                              value: values[ix],
                            });
                          });
                        }

                        // {
                        //   setForm(form => ({
                        //     ...form,
                        //     scene: "regular",
                        //   }));
                        // }
                        const warn = markWarn(head, body);
                        // console.log("RX useReceive RxResult:", warn);
                        return {
                          ...it,
                          // hint,
                          feedRx: DUMB_FEED,
                          size: Math.max(1, max(body)),
                          page: Math.max(1, Math.ceil((max(body) + 1) / 100)),
                          messages: [...it.messages, parser.rx(payload)],
                          transmit: false,
                          // scene: "regular",
                          ui: {
                            ...it.ui,
                            warn,
                          },
                        };
                      }

                      const warn = markWarn(it.head, it.body);
                      return {
                        ...it,
                        feedRx: parser.rx(payload),
                        size: Math.max(1, max(body)),
                        page: Math.max(1, Math.ceil((max(body) + 1) / 100)),
                        sendStatus: true,
                        // sendNumber: payload.progress === 0 ? it.sendNumber + 1 : it.sendNumber,
                        ui: {
                          ...it.ui,
                          warn,
                        },
                      };
                    } else {
                      if (payload.complete) {
                        const hint: Array<{
                          label: string;
                          value: string;
                        }> = [];
                        if (payload.parsed && payload.parsed.hints && payload.parsed.suggestions) {
                          const labels: string[] = payload.parsed.hints;
                          const values: string[] = payload.parsed.suggestions;
                          labels.forEach((_, ix) => {
                            hint.push({
                              label: labels[ix],
                              value: values[ix],
                            });
                          });
                        }
                        // if(payload.parsed.text.indexOf("GB")>=0)
                        // const warn = markWarn(it.head, it.body);
                        return {
                          ...it,
                          hint,
                          feedRx: DUMB_FEED,
                          messages: [...it.messages, parser.rx(payload)],
                          ui: {
                            ...it.ui,
                            // warn,
                            // warn: true,
                          },
                          sendStatus: false,
                          // sendNumber: it.sendNumber - 1,
                        };
                      }

                      // const warn = markWarn(it.head, it.body);
                      return {
                        ...it,
                        feedRx: parser.rx(payload),
                        ui: {
                          ...it.ui,
                          // warn,
                        },
                      };
                    }
                    // markWarn(it.head, it.body);
                  });

                  // }
                  // else {
                  //   const warn = markWarn(form.head, form.body);
                  //   setForm(it => ({
                  //     ...it,
                  //     feed: DUMB_FEED,
                  //     messages: [...it.messages, parser.rx(payload)],
                  //     transmit: false,
                  //
                  //     // scene: "regular",
                  //     ui: {
                  //       ...it.ui,
                  //       warn,
                  //     },
                  //   }));
                  // }
                }
                //物理状态监控
                else if (payload.tag === "PhyStatus") {
                } else {
                  console.warn("RX useReceive, unhandled messages:", payload);
                }
                // const warn = markWarn(form.head, form.body);
              }
            },
            onError: () => {
              messenger.failure("收报模块", "连接错误");
            },
            onClose: () => {
              // alert(1);
            },
          }
          // ,
        );
      } catch (ex) {
        messenger.failure("收报模块", "发生错误:" + (ex.message || ex.toString()));
      }
    })();

    //eslint-disable-next-line
  }, [setForm, mounted, markWarn]);

  useEffect(() => {
    const _socket = socket.current;
    return () => {
      _socket && _socket.end();
    };
  }, []);
};

export default useReceive;

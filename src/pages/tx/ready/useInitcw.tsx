import { Socket } from "net";
import qs from "query-string";
import { IForm } from "./typing";
import exec from "services/exec";
import xcode from "services/xcode";
import message from "misc/message";
import parser from "services/parser";
import xsession from "services/xsession";
import useMounted from "hooks/useMounted";
import { max, join, value, empty } from "misc/telegram";
import { useLocation } from "react-router";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react";
import { workingMode } from "misc/env";
import { DUMB_FEED } from "pages/rx/typing";
import xmeta from "services/xmeta";
import useHighlight from "./useHighlight";
import xregular from "services/xregular";
import { cloneDeep } from "lodash";
// import fetch from "utils/fetch";

const useInit = (setForm: Dispatch<SetStateAction<IForm>>, uuid?: string) => {
  const socket = useRef<Socket>();
  const mounted = useMounted();
  const location = useLocation();
  // console.log("location.search", location.search);
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const dir = uuid ? uuid : (search.dir as string);

  const highlight = useHighlight(setForm);
  // const taskUuid = search.taskUuid != null ? search.taskUuid : null;

  // const contactId = search.contactId as string;
  // alert(contactId);
  // setForm( x=>({
  //   ...x,
  //   contactTableId: parseInt(contactId + ""),
  // }));

  useEffect(() => {
    (async () => {
      // if (!taskUuid && dir) {
      //   const param = {
      //     datagrams: [
      //       {
      //         title: "临时任务",
      //         type: "1",
      //         uuid: dir,
      //       },
      //     ],
      //     // name: dir,
      //     name: "发送任务" + moment(Date.now()).format("YYYY年MM月DD日"),
      //     type: "1",
      //     startTime: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") + "",
      //   };
      //   const { data } = await fetch.post<ManageResponse>("/sysTask/insert", JSON.stringify(param));
      //   if (!data.data) {
      //     return;
      //   }
      //   setForm(x => ({
      //     ...x,
      //     taskid: data.data?.id + "",
      //   }));
      // }

      if (dir) {
        // alert(dir);
        const meta = (await xmeta.readServer(dir)) as McTelegramMeta;
        const codeAll = await xcode.readServer(dir, dir);
        const _regular = await xregular.readServer(dir);

        console.log("codeAll===", codeAll);
        const code = codeAll ? (codeAll["code"] as McTelegram) : null;

        if (!code) return;

        const session = await xsession.readServer(dir);
        console.log("session....", session);
        // if (meta?.type === "TB") {
        //   code.head["RMKS"].value = "CQ";
        // }
        if (codeAll) {
          // alert("session" + session);
          const size = Math.ceil(max(code.body) + 1);
          setForm(form => ({
            ...form,
            ...code,
            dir,
            session,
            type: meta?.type,
            name: meta?.name,
            pdate: meta?.ptime,
            size: size,
            finish: meta?.finish ? true : false,
            head: _regular?.head && !empty(_regular?.head) ? _regular.head : cloneDeep(code.head),
            body: _regular?.body && !empty(_regular?.body) ? _regular.body : cloneDeep(code.body),
            check: {
              ...form.check,
              head: { ...code.head },
              body: { ...code.body },
              size: size,
            },
          }));
          setForm(x => {
            x["head"]["FROM"] = {
              ...x["head"]["FROM"],
              value: "",
              crude: "",
              // light: true,
              // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
            };
            x["head"]["SIGN"] = {
              ...x["head"]["SIGN"],
              value: "",
              crude: "",
              light: false,
              ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
            };
            x["check"]["head"]["FROM"] = {
              ...x["head"]["FROM"],
              value: "",
              crude: "",
              // light: true,
              // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
            };
            x["check"]["head"]["SIGN"] = {
              ...x["head"]["SIGN"],
              value: "",
              crude: "",
              light: false,
              ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
            };
            return {
              ...x,
            };
          });
        }

        let cmd = "";

        // if (session) {   //原来代码，此处暂时屏蔽，不实用历史记录，好像有问题
        if (false) {
          cmd = `session -load ${session.path} -${workingMode}`;
        } else {
          const json = JSON.stringify({
            tag: "TelegramScript",
            isSender: true,
            type: meta?.type,
            // type: "CCK",
            body: join(code.body),
            nr: value(code.head["NR"]),
            ck: value(code.head["CK"]),
            cls: value(code.head["CLS"]),
            date: value(code.head["DATE"]),
            time: value(code.head["TIME"]),
            rmks: value(code.head["RMKS"]),
          });
          cmd = `session -tx -telegram ${json} -dualmode -profile machine`;
        }
        // }

        // cwForm.activeRadio?.ip &&
        socket.current = exec(
          cmd,
          {
            onData: payload => {
              if (mounted.current) {
                // Error
                if (payload.tag === "Error") {
                  message.failure("启动发报模块", payload.message);
                  return;
                }
                // MorseSession
                else if (payload.tag === "MorseSession") {
                  setForm(it => ({
                    ...it,
                    session: {
                      path: payload.dir,
                      name: payload.name,
                      file: payload.rxFile,
                    },
                    phystatus: true,
                  }));
                  message.destroy();
                  message.success("启动发报模块", "初始化发报模块成功。");
                } else if (payload.tag === "Result") {
                  console.log("Result=", payload);
                  //if(payload.types == "1001")
                  {
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
                        qsyShow: true,
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
                        qsyShow: true,
                        qsyMsg: titleConst,
                        sendString: "",
                        autoFlag: 0,
                      }));
                    } else if (payload.types === "1003") {
                      title = "对方申请改频，完成后确认！";
                      // sendString = "VVV 1234 DE 5678 K";
                    }
                    // const titleConst = title;
                    // debugger;
                    setForm(x => ({
                      ...x,
                      feed: DUMB_FEED,
                      transmit: false,
                    }));

                    // Modal.confirm({
                    //   okType: "danger",
                    //   centered: true,
                    //   maskClosable: true,
                    //   title: "信息提醒！",
                    //   content: titleConst,
                    //   onOk: async () => {
                    //     try {
                    //       // history.push("/tx?silent=1");
                    //       // eslint-disable-next-line no-restricted-globals
                    //       // history.push("/telegram");
                    //       // window.location.reload();
                    //       if (payload.types === "1001" || payload.types === "1003") {
                    //         setForm(x => ({
                    //           ...x,
                    //           feed: DUMB_FEED,
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
                }
                if (payload.tag === "RptResult") {
                  // alert(1);
                  console.log("RptResult.....", payload);
                  // messenger.success("收报完成", payload.tag);
                  if (payload.types === "sign") {
                    setForm(x => {
                      x["head"]["SIGN"] = {
                        ...x["head"]["SIGN"],
                        value: payload.values.SIGN.text,
                        crude: payload.values.SIGN.crude,
                        light: true,
                        // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
                      };
                      return {
                        ...x,
                      };
                    });
                  }
                }
                // RxResult
                else if (payload.tag === "RxResult") {
                  console.log("RxResult.....", payload);
                  setForm(it => {
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

                      return {
                        ...it,
                        // hint,
                        feed: DUMB_FEED,
                        feedRx: DUMB_FEED,
                        messages: [...it.messages, parser.rx(payload)],
                      };
                    } else {
                      return {
                        ...it,
                        feedRx: parser.rx(payload),
                      };
                    }
                  });
                }
                // TxResult
                else if (payload.tag === "TxResult") {
                  console.log("TX usInit111, TxResult=", payload);
                  const message = parser.tx(payload);
                  const nrCharsSent = payload.nrCharsSent;
                  const sentCnt = nrCharsSent ? parseInt(nrCharsSent) : 0;
                  console.log("sentCnt11133:", sentCnt);
                  highlight(payload.text, sentCnt, 0);
                  if (message.complete) {
                    setForm(it => ({
                      ...it,
                      feed: DUMB_FEED,
                      transmit: false,
                      sendStatus: false,
                      messages: [...it.messages, parser.tx(payload)],
                    }));
                  } else {
                    setForm(it => ({
                      ...it,
                      feed: message.complete ? DUMB_FEED : parser.tx(payload),
                      transmit: true,
                      progress: payload.progress,
                      ui: {
                        ...it.ui,
                        prepare: false,
                      },
                    }));
                  }
                }
                //物理状态监控
                else if (payload.tag === "PhyStatus") {
                }
                //others
                else {
                  setForm(it => ({
                    ...it,
                    feed: DUMB_FEED,
                  }));
                }
              }
            },
            onClose: () => {
              console.log("TX useInit, session socket closed...");

              if (mounted.current) {
                setForm(x => ({
                  ...x,
                  feed: DUMB_FEED,
                  transmit: false,
                  ui: {
                    ...x.ui,
                    prepare: false,
                  },
                }));
              }
            },
            onError: () => {
              message.failure("发报模块(初始化)", "连接错误");
            },
          }
          // ,
          // cwForm.activeRadio.ip
        );
      }
    })();
    //eslint-disable-next-line
  }, [dir, setForm, mounted]);

  useEffect(() => {
    const _socket = socket.current;
    return () => {
      _socket && _socket.end();
    };
  }, []);
};

export default useInit;

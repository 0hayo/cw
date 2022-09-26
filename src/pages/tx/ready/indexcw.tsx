import "./indexcw.less";
// import useChat from "./useChat";
import useForm from "./useForm";
import useExit from "./useExit";
import useFinish from "./useFinish";
import useSocket from "./useSocket";
import useSender from "./useSender";
import useEditor from "./useEditor";
import McBox from "components/mc-box";
import McEditor from "components/mc-editor";
import McButton from "components/mc-button";
import McSaveModal from "components/mc-tx-save-modal";
import McSendModal from "components/mc-tx-send-modal";
import React, { FC, useContext, useEffect, useMemo, useState } from "react";
import { MceFlag, MceMenu } from "mce/typing";
import McExEditor from "components/mc-ex-editor";
import McChatPanel from "containers/mc-chat-panel";
import { Modal, Pagination, Progress, Radio } from "antd";
import McLoading from "components/mc-loading";
import useInitcw from "./useInitcw";
import cwIForm from "pages/cw/form";
import CodeModal from "./codeModal";
import { useHistory, useLocation } from "react-router";
import qs from "query-string";
import useCmdSender from "socket/command-sender";
import useCmdAckHandler from "./useCmdAckHandler";
import { LOCAL_MACHINE_ID as radioUuid, getContactId, LOCAL_MACHINE_ID } from "misc/env";
import MstContext from "containers/mst-context/context";
import { Prompt } from "react-router-dom";
import McRxConsultTextModal from "components/mc-rx-consult-text-modal";
import { logInfo, logRxTxTime } from "misc/util";
import moment from "moment";
import { EditOutlined, LogoutOutlined, SwapOutlined } from "@ant-design/icons";
import withTabbar from "hoc/withTabbar";
import MstPanel from "components/mst-panel";
import McMuteButton from "components/mc-mute-btn/index";
import RadioService from "services/radio-service";
import ContactTableService from "services/contact-table-service";
import McContactViewModal from "components/mc-contact-table/contact-view-modal";
import TelegramListModal from "pages/cw/telegramListModal";
import McSpeed from "components/mc-speed";
import McFrequency from "components/mc-frequency";
// import McFrequencyView from "components/mc-frequency/freq-view";

interface IProps {
  uuid?: string;
  types?: TelegramBizType;
  cwForm?: cwIForm;
  setCwForm?: (x) => void;
  listFlag?: boolean;
}

const McReadyCwPage: FC<IProps> = ({ uuid, types, cwForm, setCwForm, listFlag }) => {
  const location = useLocation();
  const history = useHistory();
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const dir = search.dir as string;
  const contactId = search.contactId
    ? (search.contactId as string)
    : getContactId()
      ? getContactId()
      : "0";
  const showFlag = search.filetype ? true : false;
  // alert(showFlag);
  const retpath = search.retpath ? (search.retpath as string) : "";
  const original = search.original ? (search.original as string) : "";

  // alert(location.search);
  // console.log(location.search);
  const showButton = search.show ? true : showFlag ? true : false;

  // alert(dir);
  // alert(contactId);
  const [chat, setChat] = useState(true);
  const [form, setForm, setProp] = useForm();

  const socket = useSocket();
  // const player = usePlayer();

  const editor = useEditor(socket, setForm);
  const sender = useSender(socket, setForm);

  // const [pausePage, setPausePage] = useState(0);

  // const [check, setCheck] = useState(false);

  const { appType } = useContext(MstContext);

  // const [beginFlag, setBeginFlag] = useState(false);

  const [deviceType, setDeviceType] = useState(1);

  const sendBegin = x => {
    if (form.transmit) return;
    sender.chat(x);
  };
  const sendCmd = x => {
    sender.chatCmd(x);
  };

  useInitcw(setForm, uuid);
  // useChat(setForm);

  const codeShowFlag = dir === undefined ? false : listFlag ? false : !showButton ? true : false;
  const [codeShow, setCodeShow] = useState(codeShowFlag);

  const [exitFlag, setExitFlag] = useState<boolean>(false);

  const [timing, setTiming] = useState<boolean>(false);
  const [time, setTime] = useState<number>();
  const [count, setCount] = useState<number>();


  useEffect(() => {
    let timer = null;
    if (timing && time) {
      const t = time - new Date().getTime();
      if (t <= 0) return;
      setCount(t);
      timer && clearInterval(timer);
      timer = setInterval(() => {
        setCount(c => {
          let n = c - 1000;
          if (n < 0) {
            clearInterval(timer);
          }
          return n;
        });
      }, 1000);
      setTimeout(() => {
        if (form.transmit) return;
        setForm(x => ({
          ...x,
          transmit: true,
          isStar: true,
          ui: {
            ...x.ui,
            prepare: true,
          },
        }));
        setTimeout(() => {
          if (form.transmit) return;
          sendBegin("VVVDEK");
        }, 1000);
      }, t);
    }
    return () => {
      clearInterval(timer);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timing, time]);

  useEffect(() => {
    if (!contactId) {
      //使用本设备默认网系
      RadioService.getRadio(LOCAL_MACHINE_ID).then(data => {
        setProp("contactTableId")(data?.contactId);
      });
    } else {
      setProp("contactTableId")(contactId);
    }

    return () => {
      if (original === "") {
        setCodeShow(show => (show ? false : true));
      }
      setProp("startTime")(moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"));
    };
  }, [dir, contactId, original, setProp, setCodeShow]);

  //加载网系信息
  const [contactTable, setContactTable] = useState<ISysContactTable>();
  useEffect(() => {
    if (form.contactTableId) {
      //传入指定网系
      ContactTableService.getContactTable(form.contactTableId + "").then(data => {
        setContactTable(data);
      });
    }
  }, [form.contactTableId, setForm, setProp]);

  const onChangeType = e => {
    if (e === form.autoFlag) return;
    setForm(x => ({ ...x, autoFlag: e, sendStatus: false }));
  };

  useEffect(() => {
    sender.chatCmd("-auto " + form.autoFlag + "");
    if (form.autoFlag === 1) {
      setCwForm(x => ({ ...x, cwTitle: "自动模式" }));
    } else {
      setCwForm(x => ({ ...x, cwTitle: "辅助模式" }));
    }
    //eslint-disable-next-line
  }, [form.autoFlag]);

  useEffect(() => {
    sender.chatCmd("-soundFlag " + form.soundFlag + "");
    //eslint-disable-next-line
  }, [form.soundFlag]);

  // useEffect(() => {
  // setBeginFlag(false);
  //   //eslint-disable-next-line
  // }, [dir]);

  useEffect(() => {
    sender.chatCmd("-speed " + form.speed + "");
    //eslint-disable-next-line
  }, [form.speed]);

  // player.play();

  const [tbType, setTbType] = useState<boolean>(false);
  // useEffect(() => {
  //   // if (tbType) {
  //   // setForm(x => {
  //   //   return {
  //   //     ...x,
  //   //     type: tbType ? "TB" : x.types,
  //   //     types: x.type
  //   //     // head: {
  //   //     //   ...x.head,
  //   //     //   RMKS: {
  //   //     //     ...x.head["RMKS"],
  //   //     //     value: tbType ? "CQ" : x.head["RMKS"].value
  //   //     //   }
  //   //     // }
  //   //   };
  //   // });
  //   // if (form.head["RMKS"]) {
  //   //   setForm(x => {
  //   //     return {
  //   //       ...x,
  //   //       headRmks: x.head["RMKS"].value,
  //   //       head: {
  //   //         ...x.head,
  //   //         ["RMKS"]: {
  //   //           ...x.head["RMKS"],
  //   //           value: tbType ? "CQ" : x.headRmks
  //   //         }
  //   //       }
  //   //     };
  //   //   });
  //   // }
  //   // }
  // }, [tbType, setForm]);

  const send = useCmdSender();
  const processCmdAck = (ackData: AckData) => {
    const cmd = ackData.cmd;
    // alert(ackData.data.message);
    switch (cmd) {
      case "rtSendTelegram-ack":
        if (ackData.rc === -1) {
          // alert(-1);
          // setConfigFlag(true);
        } else {
          // alert("设置发报成功！")
          // setConfigFlag(false);
        }
        break;
      case "rtSendTelegramComplete-ack":
        if (ackData.rc === -1) {
          // alert(-1);
          // setConfigFlag(true);
        } else {
          // alert("设置发报成功！")
          // setConfigFlag(false);
        }
        break;
      // case "rtCheckLink-ack":
      //   // alert(111);
      //   if (ackData.rc === -1) {
      //     // alert(-1);
      //     // setConfigFlag(true);
      //   } else {
      //     // alert("设置发报成功！")
      //     // setConfigFlag(false);
      //   }
      //   break;
      default:
      //do nothing
    }
  };
  useCmdAckHandler(processCmdAck);

  // if (appType === "terminal") {
  //   // alert(2);
  //   send(cmd);
  // }

  useEffect(() => {
    const cmd: Command = {
      cmd: "rtSendTelegram",
      radioUuid: radioUuid,
    };
    if (appType === "terminal") {
      // alert(2);
      send(cmd);
    }
    // logInfo("进入发报界面，开始发报");
    // alert(33);
    // eslint-disable-next-line
  }, [appType]);

  const cmdFinsh: Command = {
    cmd: "rtSendTelegramComplete",
    radioUuid: radioUuid,
  };

  const sendFinish = () => {
    // alert(66);
    if (appType === "terminal") {
      send(cmdFinsh);
    }
    // logInfo("退出发报");
  };

  const exit = useExit(form, sendFinish, showButton, () => {
    sendCmd("-stopsox sox");
  });
  const finish = useFinish(setForm, sendFinish);
  return (
    <div className="mc-tx-ready-cw-page">
      <div className="tx-main-panel">
        <MstPanel
          className="tx-editor-panel"
          title={
            <>
              <div className="tx-telegram-name">{`发报 - ${form.type === "EX" ? "无线电信号" : "等幅报"
                } (${form.name})`}</div>
            </>
          }
        >
          {form.type === "EX" ? (
            <McExEditor
              readonly
              head={form.head}
              body={form.body}
              flag={MceFlag.State}
              // menu={
              //   form.transmit || form.autoFlag === 1
              //     ? MceMenu.None
              //     : MceMenu.Prefix | MceMenu.Suffix
              // }
              menu={MceMenu.None}
              onReady={mci => {
                editor.handleReady(mci);
              }}
            />
          ) : (
            <McEditor
              readonly
              head={form.head}
              body={form.body}
              flag={MceFlag.State}
              menu={
                form.transmit || form.autoFlag === 1
                  ? MceMenu.None
                  : MceMenu.Prefix | MceMenu.Suffix
              }
              // menu={MceMenu.None}
              offset={form.page * 100 - 100}
              onReady={mci => {
                editor.handleReady(mci);
              }}
              direction="tx"
              type={form.type}
            />
          )}
          <McBox className="tx-editor-pagination">
            {form.type !== "EX" && (
              <Pagination
                showLessItems
                showSizeChanger={false}
                pageSize={100}
                total={form.size}
                current={form.page}
                disabled={form.transmit}
                onChange={page => {
                  setForm(x => ({
                    ...x,
                    page: page,
                    // ui: {
                    //   ...x.ui,
                    //   autoPage: false,
                    // },
                  }));
                }}
              />
            )}
          </McBox>
          <div className="mc-tx-bottom-bar">
            <McButton
              warning
              type="primary"
              disabled={form.transmit}
              onClick={() => setProp("telegramModal")(true)}
            >
              切换报底 <SwapOutlined />
            </McButton>
            {!showButton && (
              <McButton
                icon="send"
                type="primary"
                title="全流程自动交互"
                disabled={
                  showFlag ||
                  form.transmit ||
                  form.autoFlag === 0 ||
                  form.telegramCode === "" ||
                  form.telegramCodeOther === ""
                }
                onClick={() => {
                  if (form.transmit) return;
                  setForm(x => ({
                    ...x,
                    transmit: true,
                    isStar: true,
                    ui: {
                      ...x.ui,
                      prepare: true,
                    },
                  }));
                  setTimeout(() => {
                    if (form.transmit) return;
                    sendBegin("VVVDEK");
                  }, 1000);
                }}
              >
                自动发报
              </McButton>
            )}
            {!showButton &&
              (() => {
                if (form.transmit) {
                  return (
                    <McButton
                      danger
                      icon="pause"
                      type="primary"
                      onClick={() => {
                        sendCmd("-stop cancel");
                        socket.current && socket.current.end();
                        setForm(x => ({
                          ...x,
                          transmit: false,
                          progress: 100,
                          autoFlag: 0,
                          sendStatus: false,
                          isStar: false,
                          ui: {
                            ...x.ui,
                            prepare: false,
                          },
                        }));
                      }}
                    >
                      停止发报
                    </McButton>
                  );
                }

                return (
                  <McButton
                    icon="send"
                    type="primary"
                    disabled={form.autoFlag === 1}
                    title="手动控制发报过程"
                    onClick={() => {
                      // setBeginFlag(true);
                      setForm(x => ({
                        ...x,
                        ui: {
                          ...x.ui,
                          send: true,
                        },
                        send: {
                          ...x.send,
                          whole: true,
                          page: 1,
                          dx: 0,
                          dy: 0,
                        },
                      }));
                    }}
                  >
                    手动发报
                  </McButton>
                );
              })()}
            {form.autoFlag !== 1 && !showButton && form.isStar &&
              (() => {
                if (form.transmit) {
                  return (
                    <McButton
                      danger
                      icon="pause"
                      type="primary"
                      disabled={form.autoFlag === 1}
                      onClick={() => {
                        sendCmd("-pause");
                        // socket.current && socket.current.end();
                        setForm(x => ({
                          ...x,
                          transmit: false,
                          sendStatus: false,
                          isStar: true,
                          ui: {
                            ...x.ui,
                            prepare: false,
                          },
                        }));
                      }}
                    >
                      暂停发报
                    </McButton>
                  );
                }
                return (
                  <McButton
                    icon="send"
                    type="primary"
                    title="手动控制继续发报"
                    onClick={() => {
                      // sender.emit(pausePage);
                      sendCmd("-continue");
                    }}
                  >
                    继续发报
                  </McButton>
                );
              })()}
            {!showButton && (
              <McButton
                warning
                icon="save"
                type="primary"
                disabled={form.transmit || form.ui.prepare || showFlag}
                // disabled={form.transmit || form.ui.prepare}
                onClick={() =>
                  setForm(x => ({
                    ...x,
                    finish: true,
                    ui: {
                      ...x.ui,
                      save: true,
                      exit: true,
                    },
                  }))
                }
              >
                结束并保存
              </McButton>
            )}
            {/*<McButton*/}
            {/*  icon="save"*/}
            {/*  type="primary"*/}
            {/*  // disabled={form.transmit || form.ui.prepare || !cwForm.cwReady}*/}
            {/*  disabled={form.transmit || form.ui.prepare}*/}
            {/*  onClick={() =>*/}
            {/*    setForm(x => ({*/}
            {/*      ...x,*/}
            {/*      ui: {*/}
            {/*        ...x.ui,*/}
            {/*        save: true,*/}
            {/*        exit: false,*/}
            {/*      },*/}
            {/*    }))*/}
            {/*  }*/}
            {/*>*/}
            {/*  立即保存*/}
            {/*</McButton>*/}
            <div className="mc-divider" />
            <McButton
              type="primary"
              danger={true}
              disabled={form.transmit || form.ui.prepare}
              onClick={() => {
                // logInfo("退出发报作业");

                setExitFlag(true);
                exit(form, sendFinish);
              }}
            >
              退出发报 <LogoutOutlined />
            </McButton>
          </div>
        </MstPanel>
        <div className="tx-right-panel">
          <div className="tx-control-panel">
            <div className="tx-cw-menu">
              <div className="mc-frequency-wrapper">
                <McFrequency />
              </div>
            </div>
            {!showButton && (
              <div className="tx-cw-menu">
                <div className="menu-title">交互方式</div>
                <Radio.Group onChange={e => onChangeType(e.target.value)} value={form.autoFlag}>
                  <Radio
                    value={1}
                    disabled={
                      !form.telegramCode ||
                      !form.telegramCodeOther ||
                      !form.workNumber ||
                      !form.telegramGradeCode
                    }
                  >
                    自动应答
                  </Radio>
                  <Radio value={0}>人工应答</Radio>
                </Radio.Group>
              </div>
            )}
            {!showButton && (
              <div className="tx-cw-menu">
                <div className="menu-title">对方发报方式</div>
                <Radio.Group
                  onChange={e => {
                    setDeviceType(e.target.value);
                    sendCmd(`-recvtype ${e.target.value}`);
                    //切换解码器Profile时，需要重新发送联络信息到业务服务器
                    setTimeout(() => {
                      sendCmd(
                        `-vvvsend ${form.contactTableId}|${form.telegramCode};${form.otherCode};${form.ownCode
                        }|${form.telegramCodeOther};${form.otherCodeOther};${form.ownCodeOther}|${form.telegramLevel ? form.telegramLevel.split(" ")[0] : ""
                        }|${form.workNumber}`
                      );
                    }, 2000);
                  }}
                  value={deviceType}
                >
                  <Radio value={1}>自动发报</Radio>
                  <Radio value={2}>手键拍发</Radio>
                </Radio.Group>
              </div>
            )}
            <div className="tx-cw-menu">
              <div className="menu-title">发报码速率</div>
              <McSpeed
                title=""
                value={form.speed}
                disabled={false}
                onChange={value => {
                  setForm(x => ({ ...x, speed: value }));
                }}
              />
            </div>
            <div className="tx-cw-menu">
              <div className="menu-title">发报音开关</div>
              {appType !== "control" && (
                <McMuteButton
                  title=""
                  initFlag={form.soundFlag ? false : true}
                  size="small"
                  mute={() => {
                    setForm(x => ({ ...x, soundFlag: false }));
                  }}
                  unmute={() => {
                    setForm(x => ({ ...x, soundFlag: true }));
                  }}
                  disabled={form.transmit}
                />
              )}
            </div>
            <div className="tx-cw-menu">
              <div className="menu-title">联络信息</div>
              <table className="contact-info-table">
                <thead>
                  <tr className="contact-info-table-header">
                    <td>
                      <McButton
                        type="primary"
                        size="small"
                        disabled={form.transmit}
                        onClick={() => setCodeShow(true)}
                      >
                        <EditOutlined />
                      </McButton>
                    </td>
                    <td>电报代号</td>
                    <td>被呼</td>
                    <td>自用</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>(本){form.ownName}</td>
                    <td>{form.telegramCode}</td>
                    <td>{form.otherCode}</td>
                    <td>{form.ownCode}</td>
                  </tr>
                  {
                    !tbType && (
                      <tr>
                        <td>(他){form.otherName}</td>
                        <td>{form.telegramCodeOther}</td>
                        <td>{form.otherCodeOther}</td>
                        <td>{form.ownCodeOther}</td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
            {count >= 0 && <div className="tx-cw-menu">
              <div className="menu-title">发报倒计时</div>
              <div>{parseInt((count / 1000).toString())} (秒)</div>
            </div>}
          </div>
          <Progress strokeWidth={8} showInfo={false} percent={form.progress} />
          {chat && (
            <McChatPanel
              type="tx"
              feed={form.feed}
              feedRx={form.feedRx}
              text={form.code}
              hint={form.hint}
              play={false}
              // file={form.session ? form.session.file : ""}
              onLaunch={text => sender.chat(text.toUpperCase())}
              onGoSend={it => {
                // let idxNum = 0;
                // form.messages.map(x => {
                //     // if (x.uuid === uuid)
                //
                //     {
                //         return {
                //             ...x,
                //             idx: idxNum
                //         };
                //     }
                //     idxNum = idxNum + 1;
                //     return x;
                // });
                let textarea = document.getElementById("mc-chat-textarea") as HTMLTextAreaElement;
                textarea.value = it.value.toUpperCase();
                if (it.sendStatus && it.type === "tx") {
                  if (form.transmit) {
                    setForm({
                      ...form,
                      // messages: form.messages.splice(form.messages.findIndex(item => item.uuid === it.uuid),1),
                      // messages: form.messages,
                      messages: form.messages.filter(x => x.uuid !== it.uuid),
                      sendStatus: false,
                      sendNumber: form.sendNumber - 1,
                    });
                    sender.chat(it.value.toUpperCase());
                    setForm(x => ({ ...x, transmit: true }));
                  } else {
                    alert("正在发送中，请发送完成后再点击！");
                  }
                }
              }}
              messages={form.messages}
              disabled={form.transmit}
              onClose={() => setChat(false)}
              onChange={(uuid, text) => {
                const next = form.messages.map(x => {
                  if (x.uuid === uuid) {
                    return {
                      ...x,
                      value: text.toUpperCase(),
                    };
                  }
                  return x;
                });
                setProp("messages")(next);
              }}
            />
          )}
        </div>
      </div>
      <McSaveModal
        title="保存发报记录"
        name={form.name}
        exit={form.ui.exit}
        // date={form.date}
        date={new Date().toISOString()}
        visible={form.ui.save}
        send={true}
        finish={form.finish}
        onCancel={() => {
          setForm(x => ({
            ...x,
            ui: {
              ...x.ui,
              save: false,
            },
          }));
        }}
        onChange={data => {
          setForm(x => ({
            ...x,
            name: data.name,
            date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            finish: data.finish ? true : false,
          }));
        }}
        onSubmit={() => {
          if (form.name === "") {
            Modal.error({
              title: "信息提醒",
              content: "请输入报文名称",
            });
            return;
          }
          sendFinish();
          logRxTxTime("tx", form.startTime, moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"));
          sendCmd("-stopsox sox");
          setForm(x => {
            x.date = new Date().toISOString();
            return {
              ...x,
            };
          });
          logInfo("保存发报:" + form.name);
          // alert(form.date);
          finish(form, cwForm);

          setTimeout(() => {
            setExitFlag(true);
            if (retpath === "send") {
              history.push("/files/sent");
            } else {
              history.push("/home");
            }
          }, 500);
        }}
        onExit={() => exit(form)}
      >
        * 保存此次发报记录
      </McSaveModal>
      <McSendModal
        title="发送电文"
        visible={form.ui.send}
        role={form.send.role}
        page={form.send.page}
        size={form.size}
        dx={form.send.dx}
        dy={form.send.dy}
        repeat={form.send.repeat}
        whole={form.send.whole}
        continuous={form.send.continuous}
        type={form.type}
        onSubmit={
          form.send.whole
            ? (a, b, c, pauseAtPage) => {
              sender.emit(pauseAtPage);
              // setPausePage(pauseAtPage);
            }
            : form.send.role === "body"
              ? (r, i, p, c) => {
                editor.handleMarkSendBody(r, i, p, c);
              }
              : (r, i, p, c) => {
                editor.handleMarkSendHead(r);
              }
        }
        onCancel={() =>
          setForm(form => ({
            ...form,
            ui: {
              ...form.ui,
              send: false,
            },
            send: {
              ...form.send,
              whole: false,
            },
          }))
        }
      />
      {/* <McTxCheckModal
        visible={check}
        form={form}
        setForm={setForm}
        onCancel={() => setCheck(false)}
        title={form.type === "EX" ? "编辑报底" : "检查报底"}
      /> */}

      <CodeModal
        visible={codeShow && !showFlag}
        form={form}
        setForm={setForm}
        sendCmd={sendCmd}
        time={time}
        setTime={setTime}
        setTiming={setTiming}
        setTbType={setTbType}
        tbType={tbType}
        timing={timing}
        onShow={() => setCodeShow(false)}
        onCancel={() => {
          // form.body["rmks"].value = "11111";
          if (
            !form.telegramCode ||
            !form.ownCode ||
            !form.otherCode ||
            !form.telegramCodeOther ||
            !form.ownCodeOther ||
            !form.otherCodeOther ||
            !form.telegramGradeCode ||
            !form.workNumber
          ) {
            Modal.confirm({
              centered: true,
              maskClosable: false,
              title: "信息确认",
              content: "不选择电报代号等联络信息，将不能使用智能应答模式！",
              onOk: () => {
                setForm(x => ({ ...x, autoFlag: 0 }));
                setCodeShow(false);
              },
            });
          } else {
            setCodeShow(false);
          }
        }}
      />
      {/*<Prompt message="确定要离开？"  when={true}/>*/}
      <Prompt
        when={!exitFlag ? (dir ? (original === "exec" ? false : true) : false) : false}
        message={next => {
          // const search = qs.parse(next.search);
          // if (isEmpty(search.silent)) {
          //   return "离开当前页面？";
          // }
          // if (exitFlag) {
          //   return true;
          // } else {
          //   // alert(77);
          //   // form.head ? alert(88) : alert(77) ;
          //   if (search.dir) {
          //     // alert(77);
          //     sendFinish();
          //   }
          // }

          Modal.confirm({
            centered: true,
            maskClosable: false,
            title: "结束发报",
            content: "发报信息未保存，您确定要离开吗？",
            onOk: () => {
              logRxTxTime("tx", form.startTime, moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"));
              sendFinish();
              sendCmd("-stopsox sox");
              setTimeout(() => {
                setExitFlag(true);
                sendFinish();
                history.push(`${next.pathname}${next.search ? next.search : ""}`);
                return false;
              }, 200);
            },
          });

          return false;
        }}
      />
      {form.qsyShow && (
        <McRxConsultTextModal
          // msg={"信号质量差，请对方检查发信机，已报送班长席，请等待.................."}
          msg={form.qsyMsg}
          contactTableId={Number(contactId)}
          onSubmit={() => {
            // alert(phrase);
            if (form.sendString !== "") {
              sendBegin(form.sendString);
            }
            sendCmd("-auto 0");
            setForm(x => ({
              ...x,
              qsyShow: false,
              autoFlag: 0,
            }));
          }}
          onCancel={() => {
            // setQsyShow(false);
            sendCmd("-auto 0");
            setForm(x => ({
              ...x,
              qsyShow: false,
              autoFlag: 0,
            }));
          }}
        />
      )}
      {form.ui.contact && (
        <McContactViewModal
          onClose={() => setForm(x => ({ ...x, ui: { ...x.ui, contact: false } }))}
          contactId={form.contactTableId + ""}
          contactName={contactTable ? contactTable.contactName : ""}
        />
      )}
      <TelegramListModal
        visible={form.telegramModal}
        onCancel={() => {
          sender.chatCmd("-stopsox sox");
          setTimeout(() => {
            sendFinish();
            setProp("telegramModal")(false);
            history.push("/home");
          }, 500);
        }}
        hideFun={() => {
          setProp("telegramModal")(false);
        }}
      />
      {form.ui.prepare && <McLoading>准备发送</McLoading>}
    </div>
  );
};

export default withTabbar(McReadyCwPage)("tx");

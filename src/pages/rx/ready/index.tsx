import "./index.less";
import { IProps } from "../typing";
import useSave from "../useSave";
import useSender from "./useSender";
import useSocket from "./useSocket";
import useEditor from "./useEditor";
import { MceMenu } from "mce/typing";
import { empty } from "misc/telegram";
import McBox from "components/mc-box";
import { useHistory, useLocation } from "react-router";
import McButton from "components/mc-button";
import McEditor from "components/mc-editor";
import McExEditor from "components/mc-ex-editor";
import McCodeModal from "containers/mc-code-modal";
import McChatPanel from "containers/mc-chat-panel";
import McSaveModal from "components/mc-rx-save-modal";
import { Progress, Pagination, Modal } from "antd";
import React, { FC, useContext, useEffect, useMemo, useState } from "react";
import useMounted from "hooks/useMounted";
import useReceive from "./useReceive";
import McRegularModal from "./regular-confirm-modal";
import useRegular from "./useRegular";
import CodeModal from "./codeModal";
import { CheckOutlined, EditOutlined, LogoutOutlined } from "@ant-design/icons";
import qs from "query-string";
import useCmdSender from "socket/command-sender";
import useCmdAckHandler from "pages/tx/ready/useCmdAckHandler";
import { getContactId, LOCAL_MACHINE_ID, LOCAL_MACHINE_ID as radioUuid } from "misc/env";
import MstContext from "containers/mst-context/context";
import { Prompt } from "react-router-dom";
import message from "misc/message";
import { logInfo, logRxTxTime } from "misc/util";
import McTaskExecModal from "components/mc-exec-task-modal";
import useForward from "../useForward";
import moment from "moment";
import McRxConsultModal from "components/mc-rx-consult-modal";
import McRxConsultTextModal from "components/mc-rx-consult-text-modal";
import withTabbar from "hoc/withTabbar";
import MstPanel from "components/mst-panel";
import ContactTableService from "services/contact-table-service";
import McMuteButton from "components/mc-mute-btn";
import RadioService from "services/radio-service";
import McContactViewModal from "components/mc-contact-table/contact-view-modal";
import { Radio } from "antd";
import McSpeed from "components/mc-speed";
import McFrequency from "components/mc-frequency";
// import McFrequencyView from "components/mc-frequency/freq-view";
// import McFrequency from "components/mc-frequency";

const McRxReady: FC<IProps> = ({ form, setForm, cwForm, setCwForm }) => {
  const socket = useSocket();
  useReceive(setForm, cwForm, form);
  const sender = useSender(socket, setForm);
  const save = useSave(setForm);
  const forward = useForward(setForm);
  const history = useHistory();
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const retpath = search.retpath !== null ? (search.retpath as string) : "";
  const scene = search.scene !== null ? (search.scene as string) : "";
  const mounted = useMounted();

  // const dir = search.dir as string;
  // const showFlag = search.filetype  ? true : false;
  // const showButton = search.show  ? true : showFlag ? true : false ;

  // const player = usePlayer();
  // const [initPlay] = useState(false);

  const contactId =
    search.contactId != null ? (search.contactId as string) : getContactId() ? getContactId() : "0";
  const { appType } = useContext(MstContext);

  // const [exitFlag, setExitFlag] = useState<boolean>(false);

  // const [qsyShow, setQsyShow] = useState<boolean>(true);

  const editor = useEditor(socket, setForm);
  const [showRegular, setShowRegular] = useState(false);
  const regular = useRegular(setForm);
  const [showExecModal, setShowExecModal] = useState(false);

  useEffect(() => {
    if (!contactId) {
      //使用本设备默认网系
      RadioService.getRadio(LOCAL_MACHINE_ID).then(data => {
        setForm(x => ({ ...x, contactTableId: data?.contactId }));
      });
    } else {
      setForm(x => ({ ...x, contactTableId: parseInt(contactId) }));
    }
    // alert(1);
    setForm(x => ({
      ...x,
      contactTableId: parseInt(contactId),
      startTime: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    }));
  }, [contactId, setForm]);

  //加载网系信息
  const [contactTable, setContactTable] = useState<ISysContactTable>();
  useEffect(() => {
    if (form.contactTableId) {
      //传入指定网系
      ContactTableService.getContactTable(form.contactTableId + "").then(data => {
        setContactTable(data);
      });
    }
  }, [form.contactTableId, setForm]);

  //当报头、正文、收发消息等关键信息发生变化时，重置保存标志
  useEffect(() => {
    setForm(x => ({ ...x, saved: false }));
  }, [
    setForm,
    form.body,
    form.head,
    form.name,
    form.type,
    form.date,
    form.state,
    form.size,
    form.regular,
    form.messages,
  ]);

  // useEffect(() => {
  //   if (appType === "control") {
  //     player.play();
  //   }
  //   // eslint-disable-next-line
  // }, [initPlay]);

  // alert(form.type);
  const onChangeType = e => {
    if (e === form.autoFlag) return;
    setForm(x => ({ ...x, autoFlag: e }));
  };
  // const [deviceType, setDeviceType] = useState(1);
  const [codeShow, setCodeShow] = useState(true);

  useEffect(() => {
    sender.chatCmd("-auto " + form.autoFlag + "");
    if (form.autoFlag === 1) {
      setCwForm && setCwForm(x => ({ ...x, cwTitle: "自动模式" }));
    } else {
      setCwForm && setCwForm(x => ({ ...x, cwTitle: "辅助模式" }));
    }
    // eslint-disable-next-line
  }, [form.autoFlag]);

  useEffect(() => {
    sender.chatCmd("-rxtype " + form.type + "");
    //eslint-disable-next-line
  }, [form.type]);

  useEffect(() => {
    sender.chatCmd("-soundFlag " + form.soundFlag + "");
    //eslint-disable-next-line
  }, [form.soundFlag]);

  useEffect(() => {
    sender.chatCmd("-speed " + form.speed + "");
    //eslint-disable-next-line
  }, [form.speed]);

  // const mounted = useMounted();
  const sendBegin = x => {
    sender.chat(x, cwForm);
  };
  const sendCmd = x => {
    sender.chatCmd(x, cwForm);
  };

  useEffect(() => {
    console.log(location);
    if (location.state) {
      setCodeShow(false);
      const { telegramCode, otherCode, ownCode, telegramCodeOther, otherCodeOther, ownCodeOther, workNumber, ownName, otherName, contactTableId } = location.state as any;
      setForm(x => ({
        ...x,
        ui: {
          ...x.ui,
          code: false
        },
        telegramCode: telegramCode,
        otherCode: otherCode,
        ownCode: ownCode,
        telegramCodeOther: telegramCodeOther,
        otherCodeOther: otherCodeOther,
        ownCodeOther: ownCodeOther,
        workNumber: workNumber,
        ownName,
        otherName,
        autoFlag: 1,
        contactTableId: contactTableId,
      }));

      localStorage.setItem("WORK_NUM", workNumber);

      sendCmd(
        "-vvvrecv " +
        contactTableId +
        "|" +
        telegramCodeOther +
        ";" +
        otherCodeOther +
        ";" +
        ownCodeOther +
        "|" +
        telegramCode +
        ";" +
        otherCode +
        ";" +
        ownCode +
        "|" +
        workNumber
      );
    }
    // eslint-disable-next-line
  }, [location, setForm]);

  const [deviceType, setDeviceType] = useState(1);

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
      default:
      //do nothing
    }
  };
  useCmdAckHandler(processCmdAck);

  const cmd: Command = {
    cmd: "rtReceiveTelegram",
    radioUuid: radioUuid,
  };

  useEffect(() => {
    if (appType === "terminal" && scene !== "regular") {
      // alert(2);
      send(cmd);
    }
    // logInfo("进入收报界面，开始收报");
    // eslint-disable-next-line
  }, [appType]);

  // alert(appType);
  // if (appType === "terminal") {
  //   alert(2);
  //   send(cmd);
  // }

  const cmdFinsh: Command = {
    cmd: "rtReceiveTelegramComplete",
    radioUuid: radioUuid,
  };

  const sendFinish = () => {
    // alert(3);
    if (appType === "terminal") {
      send(cmdFinsh);
    }
    // logInfo("退出收报界面");
  };

  return (
    <div className="mc-rx-ready">
      <div className="rx-main-panel">
        <MstPanel
          className="rx-editor-panel"
          title={form.type === "EX" ? "收报 - 无线电信号" : "收报 - 等幅报"}
        >
          {form.type === "EX" ? (
            <McExEditor
              readonly
              head={form.head}
              body={form.body}
              flag={form.flag}
              // menu={form.transmit ? MceMenu.None : MceMenu.Suffix}
              menu={MceMenu.None}
              onReady={editor.handleReady}
            />
          ) : (
            <McEditor
              readonly={true}
              head={form.head}
              body={form.body}
              flag={form.flag}
              menu={
                form.transmit || form.autoFlag === 1
                  ? MceMenu.None
                  : MceMenu.Prefix | MceMenu.Suffix
              }
              // menu={MceMenu.Prefix | MceMenu.Suffix}
              // menu={MceMenu.None}
              offset={form.page * 100 - 100}
              onReady={editor.handleReady}
              direction="rx"
              type={form.type}
            />
          )}
          <McBox className="rx-editor-pagination">
            {form.type !== "EX" && (
              <Pagination
                showLessItems
                showSizeChanger={false}
                pageSize={100}
                total={form.size}
                current={form.page}
                onChange={page => {
                  setForm(x => ({
                    ...x,
                    page,
                  }));
                }}
              />
            )}
          </McBox>
          <div className="mc-rx-bottom-bar">
            <McButton
              danger
              icon="pause"
              type="primary"
              disabled={!form.transmit}
              onClick={() => {
                setForm(x => ({
                  ...x,
                  autoFlag: 0,
                  transmit: false,
                }));
                sendCmd("-stop cancel");
                socket.current && socket.current.end();
              }}
            >
              停止发送
            </McButton>
            {/* {form.isStar &&
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
                    disabled={form.autoFlag === 1}
                    title="手动控制继续发报"
                    onClick={() => {
                      // setBeginFlag(true);
                    }}
                  >
                    继续发报
                  </McButton>
                );
              })()} */}
            <div className="mc-divider" />
            <McButton
              warning
              type="primary"
              onClick={() => {
                // if (form.regular && (!empty(form.regular.head) || !empty(form.regular.body))) {
                //   setShowRegular(true);
                // } else {
                Modal.confirm({
                  centered: true,
                  maskClosable: false,
                  title: "收报完成",
                  content: "点击确定将中断本次收报处理并进入到整报界面，确定完成收报？",
                  onOk: () => {
                    regular.cover();
                    regular.goto();
                  },
                });
                // }
              }}
              disabled={form.transmit || empty(form.body)}
            >
              整报校报 <CheckOutlined />
            </McButton>
            <McButton
              icon="save"
              type="primary"
              onClick={() => {
                if (!form.regular || empty(form.regular.head) || empty(form.regular.body)) {
                  Modal.confirm({
                    centered: true,
                    maskClosable: false,
                    title: "收报完成",
                    content: "您未进行校报操作，确定完成收报？",
                    onOk: () => {
                      setForm(x => ({
                        ...x,
                        regular: {
                          head: x.head,
                          body: x.body,
                          offset: x.offset,
                          page: x.page,
                          role: x.role,
                          size: x.size,
                        },
                        ui: {
                          ...x.ui,
                          save: true,
                        },
                      }));
                    },
                  });
                } else {
                  setForm(x => ({
                    ...x,
                    ui: {
                      ...x.ui,
                      save: true,
                    },
                  }));
                }
              }}
            >
              结束并保存
            </McButton>
            <McButton
              danger
              type="primary"
              onClick={() => {
                Modal.confirm({
                  okType: "danger",
                  centered: true,
                  maskClosable: false,
                  title: "结束收报？",
                  content: "确定要退出？此次收报过程中产生的记录将不会被保存。",
                  onOk: async () => {
                    try {
                      sendCmd("-stopsox sox");
                      setForm(x => ({ ...x, saved: true }));
                      setTimeout(() => {
                        sendFinish();
                        // setExitFlag(true);
                        if (retpath === "recv") {
                          history.push("/files/recv");
                        } else {
                          history.push("/home");
                        }
                      }, 500);
                    } catch (ex) {
                      message.failure("发生错误", ex.message || ex.toString());
                    }
                  },
                });
              }}
            >
              退出收报 <LogoutOutlined />
            </McButton>
          </div>
        </MstPanel>
        <div className="rx-right-panel">
          <div className="rx-control-panel">
            <div className="rx-cw-menu">
              <div className="mc-frequency-wrapper">
                <McFrequency />
              </div>
            </div>
            <div className="rx-cw-menu">
              <div className="menu-title">交互方式</div>
              <Radio.Group onChange={e => onChangeType(e.target.value)} value={form.autoFlag}>
                <Radio
                  value={1}
                  disabled={!form.telegramCode || !form.telegramCodeOther || !form.workNumber}
                >
                  自动应答
                </Radio>
                <Radio value={0}>人工应答</Radio>
              </Radio.Group>
            </div>
            <div className="rx-cw-menu">
              <div className="menu-title">对方发报方式</div>
              <Radio.Group
                // disabled={form.transmit}
                onChange={e => {
                  setDeviceType(e.target.value);
                  sendCmd(`-recvtype ${e.target.value}`);
                  //切换解码器Profile时，需要重新发送联络信息到业务服务器
                  setTimeout(() => {
                    sendCmd(
                      `-vvvrecv ${form.contactTableId}|${form.telegramCode};${form.otherCode};${form.ownCode}|${form.telegramCodeOther};${form.otherCodeOther};${form.ownCodeOther}|${form.workNumber}`
                    );
                  }, 2000);
                }}
                value={deviceType}
              >
                <Radio value={1}>自动发报</Radio>
                <Radio value={2}>手键拍发</Radio>
              </Radio.Group>
            </div>
            <div className="rx-cw-menu">
              <div className="menu-title">报文类型</div>
              <Radio.Group
                onChange={e => {
                  setForm(x => ({
                    ...x,
                    type: e.target.value,
                  }));
                }}
                value={form.type === "EX" ? "EX" : "CW"}
              >
                <Radio value="CW">等幅报</Radio>
                <Radio value="EX">无线电信号</Radio>
              </Radio.Group>
            </div>
            <div className="rx-cw-menu">
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
            <div className="rx-cw-menu">
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
            <div className="rx-cw-menu">
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
                  <tr>
                    <td>(他){form.otherName}</td>
                    <td>{form.telegramCodeOther}</td>
                    <td>{form.otherCodeOther}</td>
                    <td>{form.ownCodeOther}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <Progress showInfo={false} percent={form.progress} />
          {form.ui?.chat && (
            <McChatPanel
              type="rx"
              feed={form.feed}
              feedRx={form.feedRx}
              text={form.code}
              hint={form.hint}
              file={form.session ? form.session.file : ""}
              onLaunch={text => sender.chat(text, cwForm)}
              messages={form.messages}
              disabled={form.transmit}
              play={false}
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
                textarea.value = "  ";
                textarea.value = it.value.toUpperCase();
                // if (it.sendStatus && it.type === "tx") {
                if (it.type === "tx") {
                  console.log("uuid=", it.uuid);
                  if (form.progress === 100 || form.progress === 0) {
                    setForm({
                      ...form,
                      // messages: form.messages.splice(form.messages.findIndex(item => item.uuid === it.uuid),1),
                      messages: form.messages.filter(x => x.uuid !== it.uuid),
                      // messages: form.messages,
                      sendStatus: false,
                      sendNumber: form.sendNumber - 1,
                    });
                    sender.chat(it.value.toUpperCase(), cwForm);
                  } else {
                    alert("正在发送中，请发送完成后再点击！");
                  }
                }
              }}
              onClose={() => {
                setForm(x => ({
                  ...x,
                  ui: {
                    ...x.ui,
                    chat: false,
                  },
                }));
              }}
              onChange={(uuid, text) => {
                const messages = form.messages.map(x => {
                  if (x.uuid === uuid) {
                    return {
                      ...x,
                      value: text,
                    };
                  }
                  return x;
                });

                setForm(x => ({
                  ...x,
                  messages,
                }));
              }}
            />
          )}
        </div>
        <McCodeModal
          type={form.type}
          role={form.role}
          head={form.head}
          body={form.body}
          file={form.session ? form.session.file : ""}
          offset={form.offset}
          count={6}
          visible={form.ui.code}
          onChange={editor.handleChange}
          onCancel={() => {
            setForm(x => ({
              ...x,
              ui: {
                ...x.ui,
                code: false,
              },
            }));
          }}
        />
        <McSaveModal
          title="保存"
          name={form.name}
          // date={form.date}
          date={new Date().toISOString()}
          state={form.state}
          visible={form.ui.save}
          print={false}
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
              ...data,
            }));
          }}
          onSubmit={() => {
            // alert(form.name);
            if (form.name === "") {
              Modal.error({
                title: "提示",
                content: "请输入报文名称",
              });
              return;
            }
            sendFinish();
            logInfo("保存收报:" + form.name);
            logRxTxTime("rx", form.startTime, moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"));
            sendCmd("-stopsox sox");
            setTimeout(() => {
              // setExitFlag(true);
              save(
                form,
                () => {
                  // alert(11111);
                  if (retpath === "") {
                    history.push("/home");
                  } else {
                    history.push("/files/recv");
                  }
                },
                cwForm
              );
            }, 500);
          }}
          onForward={() => {
            if (form.name === "") {
              Modal.error({
                title: "提示",
                content: "请输入报文名称",
              });
              return;
            }
            sendFinish();
            logRxTxTime("rx", form.startTime, moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"));
            logInfo("保存收报:" + form.name);
            if (appType === "control") {
              setForm({ ...form, ui: { ...form.ui, save: false } });
              save(form, () => {
                setShowExecModal(true);
              });
            } else {
              save(form, () => {
                forward(form);
              });
            }
          }}
          onExit={() => history.push("/home")}
        >
          * 此次收报记录将保存在:"文件管理-已收报文"文件夹下。
        </McSaveModal>

        <McRegularModal
          visible={showRegular}
          onCancel={() => setShowRegular(false)}
          onCover={() => {
            setShowRegular(false);
            regular.cover();
            regular.goto();
          }}
          onMerge={() => {
            setShowRegular(false);
            regular.merge();
            regular.goto();
          }}
          onKeep={() => {
            setShowRegular(false);
            regular.goto();
          }}
        />
        {mounted.current && codeShow && (
          <CodeModal
            visible={codeShow}
            form={form}
            contactTableId={contactId}
            setForm={setForm}
            sendCmd={sendCmd}
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
                !form.workNumber
              ) {
                Modal.confirm({
                  centered: true,
                  maskClosable: false,
                  title: "联络信息",
                  content: "不设置完整的联络信息，将不能使用智能模式！",
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
        )}

        <Prompt
          when={!form.saved}
          message={next => {
            // const search = qs.parse(next.search);
            // if (isEmpty(search.silent)) {
            //   return "离开当前页面？";
            // }
            Modal.confirm({
              centered: true,
              maskClosable: false,
              title: "结束收报",
              content: "收报信息未保存，您确定要离开吗？",
              onOk: () => {
                // alert(2);
                logRxTxTime("rx", form.startTime, moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"));
                sendCmd("-stopsox sox");
                setForm(x => ({
                  ...x,
                  telegramCode: "",
                  ownCode: "",
                  otherCode: "",
                  telegramCodeOther: "",
                  ownCodeOther: "",
                  otherCodeOther: "",
                  ownName: "",
                  otherName: "",
                  saved: true,
                }));

                setTimeout(() => {
                  // setExitFlag(true);
                  sendFinish();
                  setCodeShow(true);
                  const target = `${next.pathname}${next.search ? next.search : ""}`;
                  history.push(target);
                  window.location.reload();
                  return false;
                }, 200);
              },
            });
            return false;
          }}
        />
        {form.errorShow && (
          <McRxConsultTextModal
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
                errorShow: false,
                autoFlag: 0,
              }));
            }}
            onCancel={() => {
              // setQsyShow(false);
              sendCmd("-auto 0");
              setForm(x => ({
                ...x,
                errorShow: false,
                autoFlag: 0,
              }));
            }}
          />
        )}

        {form.qsyShow && (
          <McRxConsultModal
            msg={form.qsyMsg}
            contactTableId={Number(contactId)}
            onSubmit={phrase => {
              sendBegin(phrase);
              setForm(x => ({
                ...x,
                qsyShow: false,
              }));
            }}
            onCancel={() => {
              setForm(x => ({
                ...x,
                qsyShow: false,
              }));
            }}
          />
        )}
        {/** 执行任务: 转发 */}
        {showExecModal && (
          <McTaskExecModal
            contactTableId={form.contactTableId}
            telegram={{ uuid: form.dir, title: form.name, type: form.type }}
            currTask={{
              datagramUuid: form.dir,
              bizType: form.type,
              completeFlag: 0,
              name: form.name,
              title: form.cwTitle,
              type: "1",
            }}
            type="1" //发报
            onCancel={() => setShowExecModal(false)}
            onOk={() => forward(form)}
          />
        )}
      </div>
      {form.ui.contact && (
        <McContactViewModal
          onClose={() => setForm(x => ({ ...x, ui: { ...x.ui, contact: false } }))}
          contactId={form.contactTableId + ""}
          contactName={contactTable ? contactTable.contactName : ""}
        />
      )}
    </div>
  );
};

export default withTabbar(McRxReady)("rx");

import "./index.less";
import React, {
  FC,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PoweroffOutlined, HomeFilled, UserOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router";
import McHeaderDev from "./device";
import McBanner from "components/mc-banner";
import { ipcRenderer } from "electron";
import { Avatar, Modal } from "antd";
import { logout } from "store/actions/auth";
import store from "store";
import MstContext from "containers/mst-context/context";
import useCmdSender from "socket/command-sender";
import useCmdAckHandler from "./useCmdAckHandler";
import message from "misc/message";
import McButton from "components/mc-button";
import {
  getControlRadio,
  localUse,
  LOCAL_MACHINE_ID,
  LOCAL_MACHINE_ID as radioUuid,
  setControlRadio,
} from "misc/env";
import McTaskRemindList from "components/mc-task-remind-list";
import RadioService from "services/radio-service";
import fetch from "utils/fetch";
import qs from "query-string";
import useAudioSpeaker from "components/mc-audio-speaker/useAudioSpeaker";
import McMuteButton from "components/mc-mute-btn";
import McLoading from "components/mc-loading";
import { logInfo } from "../../misc/util";
import McAlarmMask from "components/mc-alarm-mask";
import guid from "misc/guid";

interface IProps {
  onBack?: boolean | VoidFunction;
  leading?: ReactElement;
  tailing?: ReactElement;
}

const McHeader: FC<IProps> = props => {
  const pageUuid = useRef(guid());
  const history = useHistory();
  const location = useLocation();
  const search = qs.parse(location.search);
  const working = useRef(false);
  const [loading, setLoading] = useState(false);

  const [toggle, setToggle] = useState(false);
  const dispatch = useDispatch();
  const auth = useMemo(() => store.getState().auth, []);
  const { appType } = useContext(MstContext);
  const send = useCmdSender();
  const [taskShow, setTaskShow] = useState<boolean>(false);
  const refTaskShow = useRef(taskShow);
  const [tasks, setTasks] = useState<ITask[]>([]);

  const speaker = useAudioSpeaker();

  useEffect(() => {
    refTaskShow.current = taskShow;
  }, [taskShow]);

  useEffect(() => {
    const _working = search?.mode === "rx" || search.mode === "tx";
    working.current = _working;
  }, [search]);

  useEffect(() => {
    const controlledRadio = getControlRadio();
    if (
      controlledRadio &&
      controlledRadio.radioUuid &&
      controlledRadio.radioUuid !== LOCAL_MACHINE_ID
    ) {
      speaker.startListen();
    }
  }, [speaker]);

  const processCmdAck = useCallback(
    async (ackData: AckData) => {
      if (!auth || !auth.token) return; //????????????????????????????????????????????????
      const cmd = ackData.cmd;
      const rc = ackData.rc;
      const radio: IRadioItem = await RadioService.getRadio(ackData.radioUuid);
      switch (cmd) {
        case "ctRadioRegist-ack":
          const processBtns = (
            <div className="register-process">
              <div className="register-tips">
                ??????????????????????????????????????????????????????????????????????????????
              </div>
              <McButton
                type="primary"
                onClick={() => {
                  message.destroy();
                  history.push("/setting?id=1");
                }}
                style={{ float: "right", marginRight: 24 }}
              >
                ?????????
              </McButton>
              <McAlarmMask />
            </div>
          );
          //????????????
          message.success("??????????????????", processBtns, true);
          break;
        case "ctRadioStart-ack":
          // message.success("????????????", `${ackData.data?.name}????????????`);
          break;
        case "ctRadioLogin-ack":
          message.success(
            "??????????????????",
            `${ackData.data?.userName}(${ackData.data?.groupName}) ????????? ${
              radio ? " --- " + radio.name : ""
            }???`
          );
          break;
        case "ctRadioLogout-ack":
          message.warning(
            "??????????????????",
            `${ackData.data?.userName}(${ackData.data?.groupName}) ????????? ${
              radio ? " --- " + radio.name : ""
            }???`
          );
          break;
        case "ctRadioClose-ack":
          message.warning("????????????", `?????????????????????"${radio?.name}"???????????????????????????????????????`);
          break;
        case "ctSendTelegram-ack":
          // message.destroy();
          message.success("??????????????????", `????????????"${radio?.name}"?????????????????????`);
          break;
        case "ctSendTelegramComplete-ack":
          // message.destroy();
          message.success("??????????????????", `????????????"${radio?.name}"??????????????????`);
          break;
        case "ctReceiveTelegram-ack":
          // message.destroy();
          message.success("??????????????????", `????????????"${radio?.name}"?????????????????????`);
          break;
        case "ctReceiveTelegramComplete-ack":
          // message.destroy();
          message.success("??????????????????", `????????????"${radio?.name}"??????????????????`);
          break;
        case "ctControlRadio-ack":
          // message.destroy();
          if (rc === 1) {
            message.success("???????????????", `????????????"${radio?.name}"???????????????`);
            setControlRadio(radio.uuid + "", radio.ip);
            //?????????????????????
            speaker.startListen();
          } else {
            message.failure("??????????????????", `??????"${radio?.name}" ${ackData.message}???`);
          }
          break;
        case "ctReleaseRadio-ack":
          // message.destroy();
          setControlRadio("", "");
          if (rc === 1) {
            message.success("???????????????", `????????????"${radio?.name}"????????????`);
            //?????????????????????
            speaker.stopListen();
          } else {
            message.failure("??????????????????", `????????????"${radio?.name}"???????????????`);
          }
          break;
        case "ctRemindTask-ack":
          //?????????????????????????????????????????????????????????????????????????????????????????????????????????
          console.log(
            "~~~~~~~?????????????????????????????????=",
            working.current,
            ", ????????????????????????????????????",
            refTaskShow.current,
            pageUuid.current
          );
          if (working.current || refTaskShow.current) {
            console.log("~~~~~~??????????????????????????????");
            break;
          }
          const processBtns2 = (
            <div className="register-process">
              <div className="register-tips">???????????????????????????????????????????????????????</div>
              <div className="register-btns">
                <McButton
                  type="primary"
                  onClick={() => {
                    setTasks(ackData.data);
                    setTaskShow(true);
                    message.destroy();
                  }}
                  style={{ float: "right", marginRight: 24 }}
                >
                  ????????????
                </McButton>
                <McButton onClick={() => message.destroy()}>??????</McButton>
                <McAlarmMask />
              </div>
            </div>
          );
          message.destroy();
          message.warning("??????????????????", processBtns2, true);
          break;
        // case "rtCheckLink-ack":
        //   const cmd: Command = {
        //     cmd: "rtCheckLink",
        //     radioUuid: radioUuid,
        //   };
        //   send(cmd);
        //   break;
        default:
        //do nothing
      }
    },
    [history, working, auth, speaker]
  );

  useEffect(() => {
    if (localUse) return; //????????????????????????????????????checkLink
    const cmd: Command = {
      cmd: "rtCheckLink",
      radioUuid: "",
      data: {
        appType: "control",
      },
    };
    const i = setInterval(() => {
      send(cmd);
    }, 5000);

    return () => {
      clearInterval(i);
    };
  }, [send, appType]);

  useCmdAckHandler(processCmdAck);

  return (
    <div
      className="mc-header"
      id="swos-app-mc-header"
      onDoubleClick={() => {
        ipcRenderer.send("toggleFullScreen");
        const el = document.getElementById("swos-app-mc-header");
        if (toggle) {
          el.setAttribute("style", "-webkit-app-region: drag");
          setToggle(false);
        } else {
          el.setAttribute("style", "-webkit-app-region: no-drag");
          setToggle(true);
        }
      }}
    >
      <div className="mc-header__devices">
        <McHeaderDev />
      </div>
      <div className="mc-header__title">
        <McBanner />
      </div>
      <div className="mc-header__right">
        {appType !== "single" && (
          <div className="mc-header__right_detail" style={{ display: "flex" }}>
            <div className="mc-header__right_detail_img">
              <Avatar
                shape="square"
                style={{ borderRadius: 4 }}
                size={48}
                // src={<img src="/avatar/admin.png" alt="??????" />}
                icon={<UserOutlined />}
              />
            </div>
            <div className="mc-header__right_detail_text">
              <div className="mc-header__right_detail_name">{auth.display_name}</div>
              {auth.id_number && (
                <div className="mc-header__right_detail_code">
                  ??????:{store.getState().auth.emp_no}
                </div>
              )}
            </div>
          </div>
        )}
        {appType === "control" && (
          <McMuteButton
            initFlag={localStorage.getItem("SPEAKER-MUTE") === "ON"}
            mute={() => speaker.mute(true)}
            unmute={() => speaker.mute(false)}
          />
        )}
        <div className="mc-header__iconBox" onClick={() => history.push("/")}>
          <HomeFilled className="mc-header__icon" />
        </div>
        <div
          className="mc-header__iconBox"
          onClick={() => {
            Modal.confirm({
              title: appType === "single" ? "????????????" : "????????????",
              content: appType === "single" ? "????????????????????????" : "????????????????????????",
              maskClosable: false,
              centered: true,
              onOk: () => {
                if (appType === "single") {
                  window.close();
                  process.exit();
                } else {
                  setLoading(true);
                  logInfo("???????????????");
                  const state = store.getState();
                  const token = state.auth?.token;
                  fetch
                    .post(
                      `/user/logout?radioUuid=${radioUuid}`,
                      JSON.stringify({ radioUuid: radioUuid }),
                      {
                        timeout: 5000,
                        headers: {
                          "Content-Type": "application/json",
                          common: {
                            Authorization: `Bearer ${token}`,
                          },
                        },
                      }
                    )
                    .then(() => {
                      history.push("/login");
                      window.location.reload();
                      setLoading(false);
                    });
                  dispatch(logout());
                }
              },
            });
          }}
        >
          <PoweroffOutlined className="mc-header__icon" />
        </div>
      </div>
      {taskShow && (
        <McTaskRemindList
          alert={false}
          tasks={tasks}
          className="workbench-task-list"
          onClose={() => {
            setTaskShow(false);
          }}
        />
      )}
      {loading && (
        <McLoading position="absolute" top="60%" left="50%" right="50%">
          ??????????????????
        </McLoading>
      )}
    </div>
  );
};

export default McHeader;

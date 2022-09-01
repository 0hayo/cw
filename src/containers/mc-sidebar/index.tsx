import "./index.less";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "antd";
import Box from "components/mc-box";
import history from "misc/history";
import Align from "components/mc-align";
import { useSelector } from "react-redux";
import SizedBox from "components/sizedbox";
// import McConnector from "containers/mc-connector";
import IconButton from "components/mc-icon-button";
import Menu from "./menu";
import store from "store";
import { useMemo } from "react";
import { UserOutlined } from "@ant-design/icons";
import { MstTheme } from "less/theme";
import useCmdSender from "socket/command-sender";
import useCmdAckHandler from "./useCmdAckHandler";
import { getAppType, localUse, LOCAL_MACHINE_ID as radioUuid } from "misc/env";
import message from "misc/message";
import McTaskRemindList from "components/mc-task-remind-list";
import McModal from "components/mc-modal";
import RadioService from "services/radio-service";
import { useLocation } from "react-router";
import qs from "query-string";
import McButton from "components/mc-button";
import McAlarmMask from "components/mc-alarm-mask";

const McSidebar: FC = () => {
  const location = useLocation();
  const search = qs.parse(location.search);
  // const modeFlag = search.mode  ? true : false;
  const working = useRef(false);
  const active = useSelector<StoreReducer, TabbarValue>(s => {
    return s.ui.tabbar;
  });

  const [radio, setRadio] = useState<IRadioItem>();
  const auth = useMemo(() => store.getState().auth, []);
  const [controlled, setControlled] = useState<boolean>(false);
  const refControlled = useRef(controlled);
  const send = useCmdSender();
  const [taskShow, setTaskShow] = useState(false);
  const refTaskShow = useRef<boolean>(taskShow);
  // const [tasks, setTasks] = useState<ITask[]>(null);
  const appType = getAppType();

  //加载本终端信息
  useEffect(() => {
    RadioService.getRadio(radioUuid).then(data => {
      setRadio(data);
      if (data?.status === 1) {
        setControlled(true);
      } else {
        setControlled(false);
      }
    });
  }, []);

  useEffect(() => {
    const _working = search?.mode === "rx" || search.mode === "tx";
    working.current = _working;
  }, [search]);

  useEffect(() => {
    refControlled.current = controlled;
  }, [controlled]);

  useEffect(() => {
    refTaskShow.current = taskShow;
  }, [taskShow]);

  const processCmdAck = useCallback(
    async (ackData: AckData) => {
      if (!auth || !auth.token || localUse || appType === "single") return; //终端未登录状态、脱网模式，不处理收到的消息
      const cmd = ackData.cmd;
      const radioCode = ackData.radioUuid;
      const _radio = await RadioService.getRadio(radioCode);

      switch (cmd) {
        case "rtRemindTask-ack":
          console.log(
            "~~~~~~~~~~收到任务提醒，工作状态=",
            working.current,
            ", 当前正在显示提醒对话框：",
            refTaskShow.current
          );
          console.log(
            "~~~~~~~~~~收到任务提醒，是否被控=",
            refControlled.current,
            ", 数据库工作状态：",
            _radio?.workStatus
          );

          //终端被控或者处于工作状态（收发报）时，或者已经显示任务到期警告对话框时，不显示到期任务警告
          if (
            working.current ||
            refControlled.current ||
            refTaskShow.current ||
            _radio?.workStatus !== 0
          ) {
            console.warn("~~~~~~~~~~不显示任务提醒！");
            break;
          }
          const processBtns2 = (
            <div className="register-process">
              <div className="register-tips">有任务即将到期或已超期，是否立即查看？</div>
              <div className="register-btns">
                <McButton
                  type="primary"
                  onClick={() => {
                    // setTasks(ackData.data);
                    setTaskShow(true);
                    message.destroy();
                  }}
                  style={{ float: "right", marginRight: 24 }}
                >
                  立即查看
                </McButton>
                <McButton onClick={() => message.destroy()}>取消</McButton>
                <McAlarmMask />
              </div>
            </div>
          );
          message.destroy();
          message.warning("任务到期提醒", processBtns2, true);
          break;
        case "rtControlRadio-ack":
          setControlled(true);
          break;
        case "rtReleaseRadio-ack":
          setControlled(false);
          // socket.connect();
          break;
        case "rtCheckLink-ack":
          // alert(2);
          // setSocketStatus(true);
          // socket.connect();
          break;
        default:
        //do nothing
      }
    },
    [working, auth, appType]
  );

  useCmdAckHandler(processCmdAck);

  useEffect(() => {
    if (localUse || appType === "single") return; //终端脱网模式或单机版不发checkLink
    const cmd: Command = {
      cmd: "rtCheckLink",
      radioUuid: radioUuid,
      data: {
        type: appType,
      },
    };
    const i = setInterval(() => {
      send(cmd);
    }, 5000);

    return () => {
      clearInterval(i);
    };
  }, [send, appType]);

  return (
    <div className="mc-sidebar">
      <div className="radio-name">{radio?.name}</div>
      <div className="login-user">
        <div className="login-user-avatar" onClick={() => setTaskShow(true)}>
          <Avatar
            size={64}
            shape="square"
            icon={<UserOutlined />}
            style={{
              borderRadius: 8,
              color: MstTheme.mc_green_color,
              backgroundColor: MstTheme.mc_black_bg_color,
            }}
          />
          <div className="login-user-name">{auth.display_name}</div>
        </div>
        {auth.group?.group_name && <div className="login-user-group">{auth.group.group_name}</div>}
      </div>
      <SizedBox height={50} />
      <Box flex="1">
        {/* <McConnector /> */}
        <SizedBox height={50} />
        <Menu
          icon="workbench"
          active={active === "workbench"}
          onClick={() => history.push("/workbench")}
        >
          工作台
        </Menu>
        {/* <Menu icon="rx" active={active === "rx"} onClick={() => history.push("/rx")}>
          智能收报
        </Menu>
        <Menu icon="tx" active={active === "tx"} onClick={() => history.push("/tx")}>
          智能发报
        </Menu> */}
        <Menu icon="board" active={active === "board"} onClick={() => history.push("/statistics")}>
          数据中心
        </Menu>
        <Menu
          icon="files"
          active={active === "files"}
          onClick={() => history.push("/files/import")}
        >
          文件管理
        </Menu>
      </Box>
      <Align align="center">
        <IconButton iconSize="48px" onClick={() => history.push("/setting")}>
          gear
        </IconButton>
      </Align>
      <McModal
        closable={false}
        style={{ width: "800px", height: "650px" }}
        footer={null}
        visible={controlled}
        centered={true}
      >
        <div style={{ fontSize: "28px", color: "white", textAlign: "center" }}>
          本终端已经被总控端接管
          <br />
          屏幕锁定中
        </div>
      </McModal>
      {taskShow && !controlled && (
        <McTaskRemindList
          // tasks={tasks}
          contactTableId={radio.contactId}
          className="workbench-task-list"
          alert={false}
          onClose={() => setTaskShow(false)}
        />
      )}
    </div>
  );
};

export default McSidebar;

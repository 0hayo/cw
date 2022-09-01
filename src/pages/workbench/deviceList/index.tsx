import React, { FC, useState, useEffect } from "react";
import { Avatar, Button, Modal } from "antd";
import fetch from "utils/fetch";
import Background from "images/workbench/WorkbenchBgc.png";
import Break from "images/workbench/Break.png";
import OnLine from "images/workbench/OnLine.png";
import OffLine from "images/workbench/OffLine.png";
import {
  ApiOutlined,
  DoubleRightOutlined,
  DownloadOutlined,
  UploadOutlined,
  HistoryOutlined,
  ControlOutlined,
  UserOutlined,
  LockOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import { MstTheme } from "less/theme";
import useCmdAckHandler from "../useCmdAckHandler";
import useCmdSender from "socket/command-sender";
import store from "store";
import { bizServerAddress } from "misc/env";
import McIcon from "components/mc-icon";

interface IProps {
  currentRadioItem: IRadioItem;
  onItemClick?: (radio: IRadioItem) => void; // 点击弹出 分配任务列表
  onDevStatusChanged?: (radio: IRadioItem) => void;
}

const sectionStyle = {
  background: `url(${Background})`,
};
const sectionActiveStyle = {
  background: `url(${Break})`,
};

const DeviceList: FC<IProps> = ({
  currentRadioItem,
  onItemClick,
  onDevStatusChanged: changeDevStatus,
}) => {
  //  定义智能收发设备信息 请求参数
  const [pages, setPages] = useState<IFormPages>({
    currentPage: 1,
    pageSize: 100,
    authorizationFlag: 1,
  });
  const [onlineRadioList, setOnlineRadioList] = useState<IRadioItem[]>([]);
  const [offlineRadioList, setOfflineRadioList] = useState<IRadioItem[]>([]);
  // const link = useLink();
  const [activeNumber, setActiveNumber] = useState<number>(0);

  const loginState = store.getState();

  // 请求智能收发设备列表
  useEffect(() => {
    setActiveNumber(0);
    const wait = fetch.post<ManageResponse>("/sysRadio/listPage", JSON.stringify(pages));
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) {
        const onList = [];
        const offList = [];
        result.data.items
          .sort((a, b) => (a.uuid > b.uuid ? 1 : -1))
          .map(item => {
            if (item.status === -1 || item.status === -2 || item.status === -3) offList.push(item);
            else onList.push(item);
            if (currentRadioItem && currentRadioItem.uuid === item.uuid) {
              onItemClick(item);
            }
            if (item.status === 1) {
              setActiveNumber(activeNumber + 1);
            }
            return item;
          });

        if (!currentRadioItem) {
          if (onList.length > 0) {
            onItemClick(onList[0]);
          } else if (offList.length > 0) {
            onItemClick(onList[0]);
          }
        }
        setOnlineRadioList(x => onList);
        setOfflineRadioList(x => offList);
      }
    });
    // eslint-disable-next-line
  }, [pages, setOnlineRadioList, setOfflineRadioList]);

  const send = useCmdSender();

  /** 处理控制端口消息 */
  const processCmdAck = (ackData: AckData) => {
    const cmd = ackData.cmd;
    switch (cmd) {
      case "ctControlRadio-ack":
        if (ackData.rc === -1) {
          setPages(x => ({ ...x }));
        } else {
          setActiveNumber(activeNumber + 1);
          setPages(x => ({ ...x }));
        }
        break;
      case "ctReleaseRadio-ack":
        if (ackData.rc === -1) {
          setPages(x => ({ ...x }));
        } else {
          setActiveNumber(activeNumber - 1);
          setPages(x => ({ ...x }));
        }
        break;
      case "ctRadioStart-ack":
        setPages(x => ({ ...x }));
        break;
      case "ctRadioLogin-ack":
        setPages(x => ({ ...x }));
        break;
      case "ctRadioLogout-ack":
        setPages(x => ({ ...x }));
        break;
      case "ctReceiveTelegram-ack":
        setPages(x => ({ ...x }));
        break;
      case "ctReceiveTelegramComplete-ack":
        setPages(x => ({ ...x }));
        break;
      case "ctSendTelegram-ack":
        setPages(x => ({ ...x }));
        break;
      case "ctSendTelegramComplete-ack":
        setPages(x => ({ ...x }));
        break;
      case "ctRadioClose-ack":
        if (loginState.auth) {
          setPages(x => ({ ...x }));
        }
        break;
      default:
      //do nothing
    }
  };

  useCmdAckHandler(processCmdAck);

  return (
    <div className="workbench_left">
      <div className="workbench_control_terminal">
        <div className="workbench_control_terminal_icon">
          <DesktopOutlined />
          <div className="workbench_control_terminal_icon_name">总控端服务器</div>
          <div className="workbench_control_terminal_icon_ip">{bizServerAddress}</div>
        </div>
        <div className="workbench_control_terminal_line_h"></div>
        <div
          className="workbench_control_terminal_line_v"
          style={
            offlineRadioList?.length === 0
              ? { marginBottom: 146 }
              : onlineRadioList?.length === 0
              ? { marginTop: 172 }
              : {}
          }
        ></div>
      </div>
      <div className="device-panel">
        <div className="workbench_title">
          <div className="workbench_title_icon">
            <img src={OnLine} alt="" />
          </div>
          <div className="workbench_title_text">在线设备</div>
        </div>
        <div className="workbench_ul">
          {onlineRadioList &&
            onlineRadioList.map((item, index) => {
              return (
                <div
                  className="workbench_ul_detail"
                  key={item.uuid}
                  onClick={e => {
                    onItemClick(item);
                  }}
                >
                  <div
                    className={
                      item.status === 1
                        ? "workbench_ul_detail_ctrl_line"
                        : "workbench_ul_detail_line"
                    }
                    style={
                      item.status === 1
                        ? {
                            animation: "ctrl-blink 1000ms infinite",
                            WebkitAnimation: "ctrl-blink 1000ms infinite",
                          }
                        : {}
                    }
                  ></div>
                  <div className="workbench_list" style={sectionStyle}>
                    <div
                      className="workbench_list_top"
                      style={item.status === 1 ? { color: MstTheme.mc_green_color } : {}}
                    >
                      <McIcon>radio</McIcon> {item.name}
                    </div>
                    <div
                      className={`workbench_btm ${
                        currentRadioItem?.uuid === item.uuid ? "workbench_btm_active" : ""
                      }`}
                    >
                      <div className="workbench_btm_head">
                        <div className="workbench_btm_img">
                          <Avatar
                            shape="square"
                            style={{ borderRadius: 4 }}
                            size={40}
                            icon={<UserOutlined />}
                          />
                        </div>
                        <div className="workbench_btm_detail">
                          <div className="workbench_btm_name">{item.userName}</div>
                          <div className="workbench_btm_text">
                            {item.workStatus === 0
                              ? item.userName
                                ? "已登录"
                                : "无用户"
                              : "正在工作"}
                          </div>
                        </div>
                      </div>
                      <div className="workbench_center">
                        <Button
                          className={`workbench_btn ${
                            item.workStatus === 0
                              ? "workbench_btn_status"
                              : item.workStatus === 2
                              ? "workbench_btn_active_recv"
                              : "workbench_btn_active"
                          }`}
                        >
                          {item.workStatus === 1
                            ? "正在发报"
                            : item.workStatus === 2
                            ? "正在收报"
                            : "待机中"}
                          {item.workStatus === 1 ? (
                            <UploadOutlined />
                          ) : item.workStatus === 2 ? (
                            <DownloadOutlined />
                          ) : (
                            <HistoryOutlined />
                          )}
                        </Button>
                      </div>
                      <div className="workbench_button_right">
                        {item.status === 0 ? (
                          <Button
                            className="stay_btn"
                            // disabled={(item.workStatus === 1 || item.workStatus === 2) ? true : false}
                            onClick={e => {
                              if (item.workStatus === 1 || item.workStatus === 2) {
                                const titleMsg =
                                  item.workStatus === 1
                                    ? "正在发报,不能接管！"
                                    : item.workStatus === 2
                                    ? "正在收报,不能接管！"
                                    : "";
                                Modal.info({
                                  title: titleMsg,
                                  okText: "确认",
                                  onOk: () => {},
                                });
                                return;
                              }
                              if (activeNumber > 0) {
                                Modal.info({
                                  title: "总控端一次只能控制一个终端",
                                  okText: "确认",
                                  onOk: () => {},
                                });
                              } else {
                                // link(item.uuid, 1, item.name, setPages);
                                Modal.confirm({
                                  centered: true,
                                  maskClosable: false,
                                  title: "接管终端确认",
                                  content: `您确定要接管【${item.name}】吗？`,
                                  onOk: async () => {
                                    const cmd: Command = {
                                      cmd: "ctControlRadio",
                                      data: {
                                        radioUuid: item.uuid,
                                      },
                                    };
                                    send(cmd);
                                  },
                                });
                              }
                            }}
                          >
                            <ControlOutlined />
                            <span className="workbench_button_right_span">接管设备</span>
                          </Button>
                        ) : item.status === 1 ? (
                          <Button
                            className="link_btn"
                            onClick={e => {
                              Modal.confirm({
                                centered: true,
                                maskClosable: false,
                                title: "断开接管终端确认",
                                content: `您确定要断开接管【${item.name}】吗？`,
                                onOk: async () => {
                                  const cmd: Command = {
                                    cmd: "ctReleaseRadio",
                                    data: {
                                      radioUuid: item.uuid,
                                    },
                                  };
                                  send(cmd);
                                },
                              });

                              // link(item.uuid, 0, item.name, setPages);
                            }}
                          >
                            <ControlOutlined />
                            <span className="workbench_button_right_span">断开接管</span>
                          </Button>
                        ) : (
                          <Button className="link_btn_b">
                            <LockOutlined
                              style={{ fontSize: 20, color: MstTheme.mc_danger_color }}
                            />
                            <span className="workbench_button_right_unregistered">设备未注册 </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* 选中图标 */}
                  {currentRadioItem && currentRadioItem.uuid === item.uuid && (
                    <div className="workbench_select">
                      <DoubleRightOutlined className="workbench_select_icon" />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
        {/* 离线设备 */}
        <div style={{ height: 24 }}></div>
        <div className="workbench_title">
          <div className="workbench_title_icon">
            <img src={OffLine} alt="" />
          </div>
          <div className="workbench_title_text">离线设备</div>
        </div>
        <div className="workbench_ul">
          {offlineRadioList &&
            offlineRadioList.map(item => {
              return (
                <div
                  className="workbench_ul_detail"
                  key={item.uuid}
                  onClick={e => {
                    onItemClick(item);
                  }}
                >
                  <div className="workbench_ul_detail_off_line"></div>
                  <div className="workbench_list" style={sectionActiveStyle}>
                    <div className="workbench_list_top active">
                      <McIcon>radio</McIcon> {item.name}
                    </div>
                    <div
                      className={`workbench_btm ${
                        currentRadioItem?.uuid === item.uuid ? "workbench_btm_active" : ""
                      }`}
                    >
                      <div className="workbench_btm_head">
                        <div className="workbench_btm_img">
                          <Avatar
                            shape="square"
                            style={{ borderRadius: 4 }}
                            size={40}
                            icon={<UserOutlined />}
                          />
                        </div>
                        <div className="workbench_btm_detail">
                          <div className="workbench_btm_name active">{item.userName}</div>
                          <div className="workbench_btm_text">上次使用</div>
                        </div>
                      </div>
                      <div className="workbench_center">
                        {/* <Button className="workbench_btn_offline">
                          {item.workStatus === 1
                            ? "正在发报"
                            : item.workStatus === 2
                            ? "正在收报"
                            : "正在待机"}
                          {item.workStatus === 1 ? (
                            <DownloadOutlined />
                          ) : item.workStatus === 2 ? (
                            <UploadOutlined />
                          ) : (
                            <HistoryOutlined />
                          )}
                        </Button> */}
                      </div>
                      <div className="workbench_button_right">
                        {item.status === -1 ? (
                          <Button className="link_btn_b">
                            <ApiOutlined
                              style={{ fontSize: 24, color: MstTheme.mc_warning_color }}
                            />
                            <span className="workbench_button_right_offline">设备离线 </span>
                          </Button>
                        ) : item.status === -2 ? (
                          <Button className="link_btn_b">
                            <ApiOutlined
                              style={{ fontSize: 24, color: MstTheme.mc_danger_color }}
                            />
                            <span className="workbench_button_right_unregistered">设备未注册 </span>
                          </Button>
                        ) : item.status === -3 ? (
                          <Button className="link_btn_b">
                            <ApiOutlined
                              style={{ fontSize: 24, color: MstTheme.mc_danger_color }}
                            />
                            <span className="workbench_button_right_unregistered">脱网模式 </span>
                          </Button>
                        ) : (
                          <Button className="link_btn_b">
                            <ApiOutlined
                              style={{ fontSize: 24, color: MstTheme.mc_warning_color }}
                            />
                            <span className="workbench_button_right_offline">
                              状态未知:${item.status}{" "}
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* 选中图标 */}
                  {currentRadioItem && currentRadioItem.uuid === item.uuid && (
                    <div className="workbench_select">
                      <DoubleRightOutlined className="workbench_select_icon" />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default DeviceList;

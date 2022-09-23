import "./index.less";
import React, { FC, useState, useEffect, useContext } from "react";
import {
  CaretLeftOutlined,
  CaretRightOutlined,
  ContactsOutlined,
  HomeOutlined,
  UnorderedListOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import McIcon from "components/mc-icon";
import history from "misc/history";
import { useSelector } from "react-redux";
import { ipcRenderer } from "electron";
import { Dropdown, Menu } from "antd";
import { getRadioUuid, getContactId } from "misc/env";
import MstContext from "containers/mst-context/context";
import guid from "misc/guid";
import getTemperature from "services/dev-temperature";

const McMainMenu: FC = () => {
  const [toggle, setToggle] = useState(false);
  const active = useSelector<StoreReducer, TabbarValue>(s => {
    return s.ui.tabbar;
  });
  const { radioIp } = useContext(MstContext);
  const [radioUuid] = useState<String>(getRadioUuid());
  const [contactId] = useState<String>(getContactId());
  const [cpuTemperature, setCpuTemperature] = useState(37);
  const [devTemperature, setDevTemperature] = useState(30);

  //监测腔体温度
  useEffect(() => {
    const listenerSync = (event, type, data) => {
      if (!data || data.length < 1) return;
      if (type === "CPU-TEMPER") {
        setCpuTemperature(Math.round(data.cpuTemperature));
      }
      // if (data && data.length > 0) {
      //   const _devTemperature = Math.round(data[0].dev_temp);
      //   setDevTemperature(_devTemperature);
      // }
    };
    ipcRenderer.on("newSysCheckData", listenerSync);
    return () => {
      ipcRenderer.removeListener("newSysCheckData", listenerSync);
    };
  }, []);
  //监测CPU温度
  useEffect(() => {
    const getCpuInof = async () => {
      const n = await getTemperature();
      setDevTemperature(Number(n));
    };

    const j = setInterval(getCpuInof, 3000);

    return () => {
      clearInterval(j);
    };
  }, []);

  return (
    <div className="mc-main-menu" style={toggle ? { width: 0, minWidth: 0 } : {}}>
      <div className="mc-main-menu_handler" title="" onClick={() => setToggle(!toggle)}>
        {toggle ? <CaretRightOutlined /> : <CaretLeftOutlined />}
      </div>
      <div className="mc-main-menu_content" style={toggle ? { display: "none" } : {}}>
        <div className="menu-card">
          <div
            className={`menu-item ${active === "telegram" ? "active" : ""}`}
            style={{ width: "80%" }}
            onClick={() => history.push("/")}
          >
            <HomeOutlined /> 工作台
          </div>
        </div>
        <div className="menu-card">
          <div className="menu-title">收发报</div>
          <Dropdown
            placement="bottom"
            disabled={active === "rx"}
            overlay={
              <Menu>
                <Menu.Item
                  key={guid()}
                  onClick={() => {
                    history.push(
                      `/cw?radioUuid=${radioUuid}&ip=${radioIp}&mode=rx&type=CCK&datagramType=TELR&contactId=${contactId}`
                    );
                  }}
                >
                  等幅报
                </Menu.Item>
                <Menu.Item
                  key={guid()}
                  onClick={() => {
                    history.push(
                      `/cw?radioUuid=${radioUuid}&ip=${radioIp}&mode=rx&type=EX&datagramType=TELR&contactId=${contactId}`
                    );
                  }}
                >
                  无线电信号
                </Menu.Item>
                <Menu.Item
                  key={guid()}
                  onClick={() => {
                    history.push(
                      `/cw?radioUuid=${radioUuid}&ip=${radioIp}&mode=rx&type=EX&datagramType=TELR&contactId=${contactId}`
                    );
                  }}
                >
                  业务公电
                </Menu.Item>
              </Menu>
            }
          >
            <div className={`menu-item ${active === "rx" ? "active" : ""}`}>
              <McIcon size="32">radar</McIcon>收报
            </div>
          </Dropdown>
          <div
            className={`menu-item ${active === "tx" ? "active" : ""}`}
            onClick={() => {
              if (active === "tx") return;
              history.push(
                `/cw?radioUuid=${radioUuid}&ip=${radioIp}&mode=tx&contactId=${contactId}&datagramType=TELS`
              );
            }}
          >
            <McIcon size="32">antenna</McIcon>发报
          </div>
        </div>
        <div className="menu-card">
          <div className="menu-title">报文管理</div>
          <Dropdown
            placement="bottom"
            disabled={active === "telegram"}
            overlayClassName="telegram-input-btn-overlay"
            overlay={
              <Menu>
                <Menu.Item key={guid()} onClick={() => history.push("/telegram/input?type=CCK")}>
                  等幅报
                </Menu.Item>
                <Menu.Item key={guid()} onClick={() => history.push("/telegram/input?type=EX")}>
                  无线电信号
                </Menu.Item>
                <Menu.Item key={guid()} onClick={() => history.push("/telegram/input?type=EX")}>
                  业务公电
                </Menu.Item>
                <Menu.Item
                  key={guid()}
                  onClick={() => history.push("/telegram/scan?type=CW&mode=video")}
                >
                  拍照识别
                </Menu.Item>
                <Menu.Item key={guid()} onClick={() => history.push("/files/import")}>
                  文件识别
                </Menu.Item>
              </Menu>
            }
          >
            <div className={`menu-item ${active === "telegram" ? "active" : ""}`}>
              <McIcon size="32">keyboard</McIcon>办报
            </div>
          </Dropdown>
          <div
            className={`menu-item ${active === "files-draft" ? "active" : ""}`}
            onClick={() => {
              if (active === "files-draft") return;
              history.push("/files/draft");
            }}
          >
            <FolderOutlined size={32} />
            报底
          </div>
          <div
            className={`menu-item ${active === "files-recv" ? "active" : ""}`}
            onClick={() => history.push("/files/recv")}
          >
            <McIcon size="32">inbox</McIcon>已收
          </div>
          <div
            className={`menu-item ${active === "files-sent" ? "active" : ""}`}
            onClick={() => history.push("/files/sent")}
          >
            <McIcon size="32">outbox</McIcon>已发
          </div>
        </div>
        <div className="menu-card">
          <div className="menu-title">数据中心</div>
          <div
            className={`menu-item ${active === "setting-phrase" ? "active" : ""}`}
            onClick={() => history.push("/statistics")}
          >
            <UnorderedListOutlined />
            数据
            <br />
            统计
          </div>
        </div>
        <div className="menu-card">
          <div className="menu-title">设置</div>
          <div
            className={`menu-item ${active === "setting-contact" ? "active" : ""}`}
            onClick={() => history.push("/setting?id=3")}
          >
            <ContactsOutlined />
            联络
            <br />
            文件
          </div>
          <div
            className={`menu-item ${active === "setting-phrase" ? "active" : ""}`}
            onClick={() => history.push("/setting?id=2")}
          >
            <UnorderedListOutlined />
            勤务
            <br />
            短语
          </div>
        </div>
      </div>
      <div
        className="mc-main-menu_bottom mc-menu-card mc-temperature"
        style={toggle ? { display: "none" } : {}}
      >
        <div className="mc-temperature">
          <div className="cpu-temperature mc-menu-item">
            <div className="temperature-title">CPU温度</div>
            <div className="temperature-content">
              <McIcon>cpu-temperature</McIcon>
              <div className="temperature-value">{cpuTemperature}℃</div>
            </div>
          </div>
          <hr />
          <div className="device-temperature">
            <div className="temperature-title">腔体温度</div>
            <div className="temperature-content">
              <McIcon>device-temperature</McIcon>
              <div className="temperature-value">{devTemperature || 35}℃</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default McMainMenu;

import "./index.less";
import React, { FC, useContext, useState } from "react";
import { Button } from "antd";
import {
  // CopyOutlined,
  DashboardOutlined,
  FolderOutlined,
  HighlightOutlined,
  LaptopOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useHistory } from "react-router";
import MstContext from "containers/mst-context/context";

const McBottomMenu: FC = () => {
  const [showButton, setShowButton] = useState(false);

  const history = useHistory();

  const showBtn = () => {
    setShowButton(true);
  };
  const hideBtn = () => {
    setShowButton(false);
  };
  const { appType } = useContext(MstContext);

  return (
    <div className="mst-bottom-menu" onMouseEnter={() => showBtn()} onMouseLeave={() => hideBtn()}>
      <div
        key="amache"
        className={`animated ${showButton ? "fadeInLeftBig" : ""} menu-buttons ${
          showButton ? "" : "menu-buttons-hide"
        }`}
      >
        {/*<Button className="menu-button" onClick={() => history.push("/home")}>*/}
        {/*  <CopyOutlined />*/}
        {/*  工作台*/}
        {/*</Button>*/}
        <>
          <Button className="menu-button" onClick={() => history.push("/workbench")}>
            <LaptopOutlined />
            工作台
          </Button>
        </>
        {appType !== "single" && (
          <Button className="menu-button" onClick={() => history.push("/telegram")}>
            <HighlightOutlined />
            办报
          </Button>
        )}
        {/* <Button className="menu-button" onClick={() => history.push("/setting")}>
          <SettingOutlined />
          监控辅导
        </Button> */}
        <Button className="menu-button" onClick={() => history.push("/statistics")}>
          <DashboardOutlined />
          数据中心
        </Button>
        <Button className="menu-button" onClick={() => history.push("/files/import")}>
          <FolderOutlined />
          文件管理
        </Button>
        <Button className="menu-button" onClick={() => history.push("/setting")}>
          <SettingOutlined />
          设置
        </Button>
      </div>
    </div>
  );
};
export default McBottomMenu;

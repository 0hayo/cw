import "./index.less";
import React, { FC, useState } from "react";
import { Button } from "antd";
import {
  DesktopOutlined,
  FolderOutlined,
  InsertRowBelowOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useHistory } from "react-router";
import { MenuOutlined } from "@ant-design/icons";

const McTopMenu: FC = () => {
  const [showButton, setShowButton] = useState(false);

  const history = useHistory();

  const showBtn = () => {
    setShowButton(true);
  };
  const hideBtn = () => {
    setShowButton(false);
  };
  // const toggleBtn = () => {
  //   setShowButton(x => !x);
  // };

  return (
    <div>
      <div
        className="mc-header__iconBox"
        style={{ zIndex: 9989 }}
        onMouseEnter={() => showBtn()}
        onMouseLeave={() => hideBtn()}
        // onClick={() => toggleBtn()}
      >
        <MenuOutlined title="系统菜单" className="mc-header__icon" />
      </div>
      <div className="mc-top-menu" onMouseEnter={() => showBtn()} onMouseLeave={() => hideBtn()}>
        <div
          key="amache"
          className={`animated menu-buttons ${showButton ? "" : "menu-buttons-hide"}`}
        >
          <>
            <Button className="menu-button" onClick={() => history.push("/home")}>
              <DesktopOutlined />
              控制台
            </Button>
          </>
          <Button className="menu-button" onClick={() => history.push("/telegram")}>
            <InsertRowBelowOutlined />
            办报
          </Button>
          <Button className="menu-button" onClick={() => history.push("/files/import")}>
            <FolderOutlined />
            报文管理
          </Button>
          <Button className="menu-button" onClick={() => history.push("/setting")}>
            <SettingOutlined />
            系统设置
          </Button>
        </div>
      </div>
    </div>
  );
};
export default McTopMenu;

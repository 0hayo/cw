import "./index.less";
import React, { FC } from "react";
import Icon from "components/mc-icon";
import classnames from "classnames";
import { useHistory } from "react-router";

const Item: FC<{
  color: string;
  active: boolean;
  onClick: VoidFunction;
}> = ({ color, active, onClick, children }) => {
  return (
    <div
      className={classnames("mc-file-menu__item", {
        "mc-file-menu__item--active": active,
      })}
      onClick={onClick}
    >
      <Icon size="48px" color={active ? "#32C5FF" : color}>
        folder
      </Icon>
      <div>{children}</div>
    </div>
  );
};

const McFileMenu: FC<{
  active: "import" | "draft" | "sent" | "recv" | "codebook" | "learn";
}> = ({ active }) => {
  const history = useHistory();

  return (
    <div className="mc-file-menu">
      <div className="mc-file-menu__head">文件夹列表</div>
      <Item
        color="#7AEE00"
        active={active === "import"}
        onClick={() => history.push("/files/import")}
      >
        导入
      </Item>
      <Item
        color="#F7B500"
        active={active === "draft"}
        onClick={() => history.push("/files/draft")}
      >
        电子报底
      </Item>
      <Item color="#44D7B6" active={active === "sent"} onClick={() => history.push("/files/sent")}>
        已发报文
      </Item>
      <Item color="#0091FF" active={active === "recv"} onClick={() => history.push("/files/recv")}>
        已收报文
      </Item>
      {/* <Item
        color="#6236FF"
        active={active === "codebook"}
        onClick={() => history.push("/files/codebook")}
      >
        密码本
      </Item> */}
      {/* <Item
        color="#6D7278"
        active={active === "learn"}
        onClick={() => history.push("/files/learn")}
      >
        学习
      </Item> */}
    </div>
  );
};

export default McFileMenu;

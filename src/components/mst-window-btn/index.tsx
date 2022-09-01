import "./index.less";
import React, { FC } from "react";
import { LogoutOutlined } from "@ant-design/icons";

interface IProps {
  onClose?: () => void;
  onMinimize?: () => void;
}

const MstWindowButton: FC<IProps> = ({ onClose, onMinimize }) => {
  return (
    <div className="mst-window-buttons">
      <LogoutOutlined onClick={() => onClose && onClose()} title="关闭" />
    </div>
  );
};

export default MstWindowButton;

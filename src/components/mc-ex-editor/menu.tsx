import "./styles/menu.less";
import React, { FC } from "react";

interface IProps {
  x: number;
  y: number;
  w: number;
  h: number;
  onClick: VoidFunction;
}

const McMenu: FC<IProps> = ({ x, y, w, h, onClick, children }) => {
  return (
    <div
      className="mc-ex-editor-menu"
      style={{
        top: y,
        left: x,
        width: w,
        height: h,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default McMenu;

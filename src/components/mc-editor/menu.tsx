import "./styles/menu.less";
import React, { FC, CSSProperties } from "react";

interface IProps {
  x: number;
  y: number;
  w: number;
  h: number;
  style?: CSSProperties;
  onClick: VoidFunction;
}

const McMenu: FC<IProps> = ({ x, y, w, h, onClick, style, children }) => {
  return (
    <div
      className="mc-editor-menu"
      style={{
        ...style,
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

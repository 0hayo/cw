import "./index.less";
import React, { FC } from "react";

interface IProps {
  align: "left" | "center" | "right";
}

const McAlign: FC<IProps> = props => {
  return <div className={`mc-align--${props.align}`}>{props.children}</div>;
};

export default McAlign;

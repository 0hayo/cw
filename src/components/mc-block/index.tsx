import "./index.less";
import classnames from "classnames";
import React, { FC } from "react";

interface IProps {
  className?: string;
}

const McBlock: FC<IProps> = ({ className, children }) => {
  return <div className={classnames(className, "mc-block")}>{children}</div>;
};

export default McBlock;

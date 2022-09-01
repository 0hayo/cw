import "./index.less";
import React, { CSSProperties, FC } from "react";
import classnames from "classnames";

interface IProps {
  id?: string;
  className?: string;
  style?: CSSProperties;
}

const Body: FC<IProps> = props => {
  return (
    <div
      id={props.id || "mc-body"}
      className={classnames("mc-body", props.className)}
      style={props.style ? props.style : {}}
    >
      {props.children}
    </div>
  );
};

export default Body;

import "./index.less";
import classnames from "classnames";
import React, { FC, CSSProperties } from "react";

interface IProps {
  spin?: boolean;
  size?: number | string;
  color?: string;
  className?: string;
}

const McIcon: FC<IProps> = ({ size, spin, color, children, className }) => {
  const style: CSSProperties = {
    color,
    fontSize: size,
  };

  return (
    <i
      className={classnames("mc-icon", className, {
        "mc-icon--spin": spin,
      })}
      style={style}
    >
      <svg className="mc-icon__svg" fontSize={size}>
        <use xlinkHref={`#icon-${children}`}></use>
      </svg>
    </i>
  );
};

export default McIcon;

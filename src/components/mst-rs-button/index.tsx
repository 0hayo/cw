import "./index.less";
import React, { FC } from "react";
import { ButtonProps } from "antd/es/button";
import { Button } from "antd";

interface IProps extends ButtonProps {
  active?: boolean;
  title?: string;
}
/**
 * 电台图标按钮
 */
const MstRadioStationButton: FC<IProps> = ({
  loading,
  children,
  className,
  active = false,
  title,
  ...rest
}) => {
  return (
    <Button
      {...rest}
      className={`mts-rs-button ${active ? "mts-rs-button__active" : ""} ${
        className ? className : ""
      }`}
    >
      <div
        className={active ? "rs-icon-active" : "rs-icon-inactive"}
        style={{ width: 18, height: 18 }}
      />
      {(() => {
        if (typeof children === "string") {
          return <span>{children}</span>;
        }
        return children;
      })()}
    </Button>
  );
};

export default MstRadioStationButton;

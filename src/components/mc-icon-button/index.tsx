import "./index.less";
import React, { FC } from "react";
import { Button } from "antd";
import McIcon from "components/mc-icon";
import classnames from "classnames";
import { ButtonProps } from "antd/es/button";

interface IProps extends ButtonProps {
  iconSize?: number | string;
  iconColor?: string;
}

const McIconButton: FC<IProps> = ({
  loading,
  children,
  className,
  iconColor,
  iconSize,
  ...rest
}) => {
  return (
    <Button
      shape="circle"
      className={classnames("mc-icon-button", className)}
      {...rest}
    >
      {(() => {
        if (loading) {
          return <McIcon spin>loading</McIcon>;
        }

        return (
          <McIcon size={iconSize} color={iconColor}>
            {children}
          </McIcon>
        );
      })()}
    </Button>
  );
};

export default McIconButton;

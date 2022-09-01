import "./index.less";
import React, { FC } from "react";
import classnames from "classnames";
import McIcon from "components/mc-icon";
import { ButtonProps } from "antd/es/button";
import { Button } from "antd";

interface IProps extends ButtonProps {
  warning?: boolean;
}

const McButton: FC<IProps> = ({ icon, loading, children, warning, className = "", ...rest }) => {
  return (
    <Button
      {...rest}
      className={classnames("mc-button", className, {
        "mc-button__warning": warning,
      })}
    >
      {(() => {
        if (typeof children === "string") {
          return <span>{children}</span>;
        }

        return children;
      })()}
      {(() => {
        if (loading) {
          return <McIcon spin>loading</McIcon>;
        }

        if (icon) {
          return <McIcon>{icon}</McIcon>;
        }
      })()}
    </Button>
  );
};

export default McButton;

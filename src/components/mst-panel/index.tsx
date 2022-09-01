import "./index.less";
import classnames from "classnames";
import React, { FC, ReactNode } from "react";
import Icon from "components/mc-icon";

interface IProps {
  header?: boolean;
  title?: string | ReactNode;
  width?: number | string;
  height?: number | string;
  onClose?: VoidFunction;
  icon?: string;
  className?: string;
  id?: string;
}

const MstPanel: FC<IProps> = ({
  header = true,
  title,
  width,
  height,
  children,
  className,
  icon,
  id,
  onClose,
}) => {
  return (
    <div
      id={id}
      style={{
        width,
        height,
      }}
      className={classnames("mst-panel", className)}
    >
      {header && (
        <div className="mst-panel__head">
          <div className="mst-panel__title">
            {icon && <Icon className="mst-panel__icon">{icon}</Icon>}
            {title}
          </div>
          {onClose && (
            <button onClick={onClose} className="mst-panel__close">
              <Icon size="18px">close</Icon>
            </button>
          )}
        </div>
      )}
      <div className="mst-panel__body">{children}</div>
    </div>
  );
};

export default MstPanel;

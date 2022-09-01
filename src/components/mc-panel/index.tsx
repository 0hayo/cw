import "./index.less";
import classnames from "classnames";
import React, { FC, ReactNode } from "react";
import Icon from "components/mc-icon";

interface IProps {
  title?: string | ReactNode;
  width?: number | string;
  height?: number | string;
  onClose?: VoidFunction;
  className?: string;
}

const Panel: FC<IProps> = ({ title, width, height, children, className, onClose }) => {
  return (
    <div
      style={{
        width,
        height,
      }}
      className={classnames("mc-panel", className)}
    >
      {title && (
        <div className="mc-panel__head">
          <div className="mc-panel__title">{title}</div>
          {onClose && (
            <button onClick={onClose} className="mc-panel__close">
              <Icon size="18px">close</Icon>
            </button>
          )}
        </div>
      )}
      <div className="mc-panel__body">{children}</div>
    </div>
  );
};

export default Panel;

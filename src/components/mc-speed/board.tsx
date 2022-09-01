import "./board.less";
import React, { FC } from "react";
import McSpeed from ".";
import { Tooltip } from "antd";
import { TooltipPlacement } from "antd/lib/tooltip";

interface IProps {
  value: number;
  disabled?: boolean;
  className?: string;
  placement?: TooltipPlacement;
  onChange: (value: number) => void;
}

const McSpeedBoard: FC<IProps> = ({
  value,
  disabled = false,
  className,
  placement = "bottom",
  onChange,
}) => {
  return (
    <Tooltip
      overlayClassName="mc-speed-bubble"
      title={
        disabled ? (
          "发送过程中不可调节"
        ) : (
          <McSpeed value={value} disabled={disabled} title="" onChange={onChange} />
        )
      }
      placement={placement}
    >
      <div className={`mc-speed-board ${className}`}>
        <div className="mc-speed-board-circle">
          <div className="mc-speed-board-value">{value}</div>
        </div>
        <div className="mc-speed-board-title">发报速率</div>
      </div>
    </Tooltip>
  );
};

export default McSpeedBoard;

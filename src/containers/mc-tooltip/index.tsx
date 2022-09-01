import React, { useState, FC, useImperativeHandle } from "react";
import { Tooltip } from "antd";

export interface IChildFun {
  updateTip: Function;
}
interface IToolTip {
  title: string;
  onRef?: any | IChildFun;
  // onChange: (value: string) => void;
}

const McTooltip: FC<IToolTip> = props => {
  //用于设置tip框提示类容
  const [tipVisible, setTipVisible] = useState(false);

  const showTip = () => {
    setTipVisible(true);
    setTimeout(() => {
      setTipVisible(false);
    }, 2000);
  };

  useImperativeHandle(props.onRef, () => {
    return {
      updateTip: showTip,
    };
  });

  return (
    <Tooltip title={props.title} visible={tipVisible}>
      {props.children}
    </Tooltip>
  );
};
export default McTooltip;

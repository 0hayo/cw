import "./index.less";
import { Spin } from "antd";
import McBox from "components/mc-box";
import React, { FC, CSSProperties } from "react";

interface IProps extends CSSProperties {
  className?: string;
  title?: string;
}

const McLoading: FC<IProps> = ({ className, title = "正在加载", ...props }) => {
  return (
    <McBox className={`mc-loading${className ? " " + className : ""}`} {...props}>
      <div className="mc-loading-box">
        <Spin
          tip={props.children ? props.children.toLocaleString() : title}
          size="large"
          // indicator={<ReloadOutlined spin />}
        ></Spin>
      </div>
    </McBox>
  );
};

export default McLoading;

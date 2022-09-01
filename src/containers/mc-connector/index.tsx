import "./index.less";
import React, { FC, useEffect } from "react";
import McIcon from "components/mc-icon";
import useMonitor from "./useMonitor";
import classnames from "classnames";

const useClass = (klass: string, active: boolean) => {
  return classnames(klass, {
    [`${klass}--active`]: active,
  });
};

const McConnector: FC = () => {
  const { devices, refresh } = useMonitor();

  useEffect(() => {
    const tid = window.setTimeout(() => refresh(false), 10 * 1000);
    return () => window.clearTimeout(tid);
  }, [refresh]);

  return (
    <div onClick={() => refresh(true)} className="mc-connector">
      <div
        title="电台"
        className={useClass("mc-connector__item", devices.radio)}
      >
        <McIcon
          size="4px"
          className={useClass("mc-connector__dot", devices.radio)}
        >
          dot
        </McIcon>
        <McIcon className="mc-connector__device">radio</McIcon>
        <span>{devices.radio ? "已连接" : "未连接"}</span>
      </div>
      <div
        title="耳机/音频输入"
        className={useClass("mc-connector__item", devices.audio)}
      >
        <McIcon
          size="4px"
          className={useClass("mc-connector__dot", devices.audio)}
        >
          dot
        </McIcon>
        <McIcon className="mc-connector__device">audio</McIcon>
        <span>{devices.audio ? "已连接" : "未连接"}</span>
      </div>
      <div
        title="摄像头"
        className={useClass("mc-connector__item", devices.camera)}
      >
        <McIcon
          size="4px"
          className={useClass("mc-connector__dot", devices.camera)}
        >
          dot
        </McIcon>
        <McIcon className="mc-connector__device">camera</McIcon>
        <span>{devices.camera ? "已连接" : "未连接"}</span>
      </div>
    </div>
  );
};

export default McConnector;

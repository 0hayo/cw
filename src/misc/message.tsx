import "./message.less";
import { notification } from "antd";
import { ReactNode } from "react";

notification.config({
  placement: "bottomRight",
});

const message = {
  success: (title: string, desc?: ReactNode, keep = false, duration = 5) => {
    const _duration = keep ? 0 : duration;
    notification.success({
      duration: _duration,
      message: title,
      description: desc,
      // top: {}
      className: "mc-message mc-message-success",
      placement: "bottomLeft",
    });
  },
  failure: (title: string, desc?: ReactNode, keep = false, duration = 5) => {
    // notification.destroy();
    const _duration = keep ? 0 : duration;
    notification.error({
      duration: _duration,
      message: title,
      description: desc,
      className: "mc-message mc-message-failure",
      placement: "bottomLeft",
    });
  },
  warning: (title: string, desc?: ReactNode, keep = false, duration = 3) => {
    const _duration = keep ? 0 : duration;
    notification.warning({
      duration: _duration,
      message: title,
      description: desc,
      className: "mc-message mc-message-warning",
      placement: "bottomLeft",
    });
  },
  destroy: () => notification.destroy(),
};

export default message;

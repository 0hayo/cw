import "./index.less";
import React, { FC, useState, useEffect } from "react";
import AudioFilePlayer from "components/mc-audio-player/audio-file-player";

interface IProps {
  /** 是否鸣响声音 */
  alarm?: boolean;
  /** 是否闪烁背景 */
  blink?: boolean;
  /** 是否敏感（鼠标点击、移动或键盘按下时停止警报） */
  sensitive?: boolean;
  className?: string;
}

const McAlarmMask: FC<IProps> = ({
  alarm = true,
  blink = true,
  sensitive = true,
  className = "mc-alarm-mask",
}) => {
  const [goAlert, setGoAlert] = useState(alarm);

  const stopAlert = () => {
    setGoAlert(false);
  };

  /** 点击/移动鼠标或键盘时停止报警 */
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      stopAlert();
    };
    const moveHandler = (e: KeyboardEvent) => {
      stopAlert();
    };
    const keyHandler = (e: KeyboardEvent) => {
      stopAlert();
    };
    document.body.addEventListener("click", clickHandler);
    document.body.addEventListener("mousemove", moveHandler);
    document.body.addEventListener("keydown", keyHandler);
    return () => {
      document.body.removeEventListener("click", clickHandler);
      document.body.removeEventListener("mousemove", moveHandler);
      document.body.removeEventListener("keydown", keyHandler);
    };
  }, []);

  return (
    <div
      tabIndex={-1}
      className={className}
      style={
        blink && goAlert
          ? {
              animation: "alarm-mask 1000ms infinite",
              WebkitAnimation: "alarm-mask 1000ms infinite",
            }
          : { zIndex: -100 }
      }
    >
      {goAlert && <AudioFilePlayer fileName="alert2.mp3" />}
    </div>
  );
};

export default McAlarmMask;

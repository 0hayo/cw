import "./index.less";
import React, { FC, useState } from "react";
import McICon from "components/mc-icon";
import { MstTheme } from "less/theme";

interface IProps {
  initFlag: boolean;
  mute: () => void;
  unmute: () => void;
  disabled?: boolean;
  title?: string;
  size?: "small" | "large";
}

const McMuteButton: FC<IProps> = ({
  initFlag,
  mute,
  unmute,
  disabled = false,
  title,
  size = "small",
}) => {
  const [muteFlag, setMuteFlag] = useState(initFlag);

  // useEffect(() => {
  //   if (muteFlag) {
  //     mute();
  //   } else {
  //     unmute();
  //   }
  // }, [muteFlag, mute, unmute]);

  return (
    <div className={`mc-mute-button ${disabled ? "mc-mute-button-disabled" : ""}`}>
      <div
        className={`mc-mute-button__iconBox ${
          size === "large" ? "mc-mute-button__iconBox_large" : ""
        }`}
        onClick={() => {
          if (disabled) return;
          const flag = !muteFlag;
          setMuteFlag(flag);
          if (flag) {
            mute();
          } else {
            unmute();
          }
        }}
      >
        <McICon
          color={
            disabled
              ? MstTheme.mc_text_color
              : muteFlag
              ? MstTheme.mc_danger_color
              : MstTheme.mc_primary_color
          }
        >
          {muteFlag ? "sound-mute" : "sound"}
        </McICon>
      </div>
      {title && <div className="mc-mute-button-title">{title}</div>}
    </div>
  );
};

export default McMuteButton;

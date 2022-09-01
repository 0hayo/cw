import { remote } from "electron";
import React, { FC } from "react";

interface IProps {
  /** 要播放的音频文件名（音频文件须放置在 /public/resources/ 下） */
  fileName: string;
  loop?: boolean;
  auto?: boolean;
}

const AudioFilePlayer: FC<IProps> = ({ fileName: file, loop = true, auto = true }) => {
  return (
    <div style={{ display: "none", width: 200, height: 100 }}>
      <audio
        src={`${
          remote.app.isPackaged ? remote.app.getAppPath() + "/build/" : "/"
        }resources/${file}`}
        loop={loop}
        autoPlay={auto}
        hidden={true}
        color="red"
      />
    </div>
  );
};

export default AudioFilePlayer;

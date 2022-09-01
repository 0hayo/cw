import "./index.less";
import React, { FC, useCallback, useState } from "react";
import McIcon from "components/mc-icon";
import useAudioSpeaker from "components/mc-audio-speaker/useAudioSpeaker";

interface IProps {
  /** 用于播放的PCM格式的音频数据(Raw Buffer 或 base64 string, 或能够返回一个base64 string的方法) */
  audioData: Buffer | string | (() => string);
  /** 类型：rx: 收到的语音，tx: 发出的语音 */
  type: "rx" | "tx";
  /** 是否未读消息（只针对rx）, （是否显示未读提示的小红点） */
  unread: boolean;
  /** 播放时的回调函数（比如可以借此回调修改未读标记） */
  onPlay: () => void;
  /** 用于自定义样式的className */
  className?: string;
}

const McAudioBar: FC<IProps> = ({
  audioData,
  type,
  unread,
  onPlay,
  className = "mc-audio-bar",
}) => {
  const [playing, setPlaying] = useState(false);
  const onStop = useCallback(() => {
    setPlaying(false);
  }, []);
  const { play, stop, getDuration } = useAudioSpeaker(onStop);

  return (
    <div
      className={`${className} ${type === "tx" ? "audio-right" : ""}`}
      onClick={() => {
        if (playing) {
          setPlaying(false);
          stop();
        } else {
          setPlaying(true);
          play(typeof audioData === "function" ? audioData() : audioData);
          onPlay();
        }
      }}
    >
      {type === "tx" && unread && <div className="audio-unread"></div>}
      {type === "rx" && (
        <McIcon className={playing ? "bling-bling blink infinite" : ""}>sound-left</McIcon>
      )}
      <div className="audio-time">
        {getDuration(typeof audioData === "function" ? audioData() : audioData)}
      </div>
      {type === "tx" && (
        <McIcon className={playing ? "bling-bling blink infinite" : ""}>sound-right</McIcon>
      )}
      {type === "rx" && unread && <div className="audio-unread" style={{ float: "right" }}></div>}
    </div>
  );
};

export default McAudioBar;

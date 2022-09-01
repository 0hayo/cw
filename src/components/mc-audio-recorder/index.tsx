import "./index.less";
import React, { FC, useState } from "react";
import { AudioFilled } from "@ant-design/icons";
import useRecorder from "./useRecorder";
import McFrequencyVoice from "components/mc-frequency-voice";
import { MstPressBtn } from "components/mst-styled-components";

interface IProps {
  /**
   * 是否实时传输：
   * - true : 音频将以PCM格式流的形式实时传输到业务服务器；
   * - false: 音频将录制成PCM格式，并以指定格式(Raw Buffer 或 base64 string)通过 onRecorded 回调函数返回给调用者；
   */
  realtime: boolean;
  /**
   * 当 realtime === true 时，此回调函数不会被调用
   * 当 realtime === false 时，此回调函数会返回指定格式(Raw Buffer 或 base64 string)的音频录音数据
   */
  onRecorded?: (result: Buffer | string) => void;
  /**
   * 录音是否回放(只有当 realtime == false 时有效)
   * echo === true 时，录制的音频在1秒后回放
   */
  echo?: boolean;
  /** 返回数据类型:
   *   raw: PCM音频数据组成的Buffer类型(Buffer类型便于通过socket传递)
   * | base64: PCM音频数据转换成的base64字符串*/
  format?: "raw" | "base64";
  disabled?: boolean;
}

/** 录制/传输音频流的组件 */
const McAudioRecorder: FC<IProps> = ({
  realtime,
  echo = false,
  children,
  onRecorded,
  format = "base64",
  disabled = false,
}) => {
  const { start, stop, playback } = useRecorder();
  const [running, setRunning] = useState(false);

  return (
    <div className="mc-recorder">
      <MstPressBtn
        autoFocus
        disabled={disabled}
        active={running ? running : false}
        onMouseDown={() => {
          setRunning(true);
          start(realtime);
        }}
        onMouseUp={() => {
          let audioData: Buffer | string = null;
          setTimeout(() => {
            setRunning(false);
            audioData = stop(realtime, format);
            if (!realtime && onRecorded) {
              onRecorded(audioData);
            }
            if (!realtime && echo) {
              setTimeout(() => {
                playback(audioData);
              }, 10);
            }
          }, 500);
        }}
        onKeyDown={event => {
          if (event.key === " " && !running) {
            setRunning(true);
            start(realtime);
          }
        }}
        onKeyUp={event => {
          if (running && event.key === " ") {
            let audioData: Buffer | string = null;
            setTimeout(() => {
              setRunning(false);
              audioData = stop(realtime, format);
              if (!realtime && onRecorded) {
                onRecorded(audioData);
              }
              if (!realtime && echo) {
                setTimeout(() => {
                  playback(audioData);
                }, 10);
              }
            }, 500);
          }
        }}
        onMouseOver={event => {
          event.currentTarget.focus();
        }}
      >
        {running ? (
          <McFrequencyVoice width="200px" height="40px" />
        ) : (
          <>
            <AudioFilled /> {children ? children : "按住说话"}
          </>
        )}
      </MstPressBtn>
    </div>
  );
};

export default McAudioRecorder;

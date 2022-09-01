import "./audio-volum-wizard.less";
import React, { FC, useCallback, useEffect, useState } from "react";
import McModalNice from "components/mc-modal-nice";
import useGuid from "hooks/useGuid";
import Recorder from "recorder-core";
import {} from "recorder-core/src/extensions/lib.fft";
//eslint-disable-next-line
import WaveSurferView from "recorder-core/src/extensions/wavesurfer.view";
import {} from "recorder-core/src/extensions/wavesurfer.view";
import {} from "recorder-core/src/engine/pcm";
import { MstTheme } from "less/theme";
import { exec } from "child_process";
import message from "misc/message";
import os from "os";
import { InputNumber, Slider } from "antd";
import McButton from "components/mc-button";

interface IProps {
  onClose: () => void;
}

// Target string example:
//     Front Left: Capture 39977 [61%] [on]
//     Front Right: Capture 39977 [42%] [on]
//     Mono: Capture 32768 150%] [on]
const REGEXP = /(?<=\[)[0-9]*(?=%])/g;

const McAudioVolumnWizard: FC<IProps> = ({ onClose }) => {
  const guid = useGuid();
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    const el = document.getElementById(`mc-${guid}`);
    const config = {
      elem: el,
      width: 520, //显示宽度
      height: 160, //显示高度
      //以上配置二选一

      scale: 4, //缩放系数，应为正整数，使用2(3? no!)倍宽高进行绘制，避免移动端绘制模糊
      fps: 30, //绘制帧率，不可过高，50-60fps运动性质动画明显会流畅舒适，实际显示帧率达不到这个值也并无太大影响
      duration: 5000, //当前视图窗口内最大绘制的波形的持续时间，此处决定了移动速率
      direction: -1, //波形前进方向，取值：1由左往右，-1由右往左
      position: 0, //绘制位置，取值-1到1，-1为最底下，0为中间，1为最顶上，小数为百分比
      centerHeight: 1, //中线基础粗细，如果为0不绘制中线，position=±1时应当设为0
      // //波形颜色配置：[位置，css颜色，...] 位置: 取值0.0-1.0之间
      linear: [0, "rgba(0,187,17,1)", 0.3, "rgba(255,215,0,1)", 1, "rgba(255,102,0,1)"],
      centerColor: MstTheme.mc_grey_color, //中线css颜色，留空取波形第一个渐变颜色
    };
    const view = Recorder.WaveSurferView(config);
    const recorder = new Recorder({
      type: "pcm",
      audioTrackSet: {
        deviceId: "",
        groupId: "",
        autoGainControl: false,
        echoCancellation: true,
        noiseSuppression: false,
      },
      onProcess: function (buffers, powerLevel, bufferDuration, bufferSampleRate) {
        if (buffers) {
          view.input(buffers[buffers.length - 1], powerLevel, bufferSampleRate); //输入音频数据，更新显示波形
        }
      },
    });
    recorder.open(function () {
      recorder.start();
    });
  }, [guid]);

  //获取系统输入音量
  useEffect(() => {
    exec("amixer -D pulse sget Capture | grep %", (error, stdout, stderr) => {
      if (error) {
        message.failure("获取系统输入音量失败。", error);
      }
      if (stderr) {
        message.failure("获取系统输入音量失败。", stderr);
      }
      let volumeStr = "";
      if (stdout) {
        const resultArr = stdout.split(os.EOL);
        console.log("-----", resultArr);
        if (resultArr && resultArr.length > 0 && resultArr[0]) {
          // example:
          // Front Left: Capture 39977 [61%] [on]
          // Front Right: Capture 39977 [42%] [on]
          // Mono: Capture 32768 [50%] [on]
          const infoLine = resultArr[0];
          if (infoLine && infoLine.trim()) {
            const matchArr = infoLine.match(REGEXP);
            if (matchArr && matchArr.length > 0 && matchArr[0]) {
              volumeStr = matchArr[0];
            }
          }
        }
      }
      if (volumeStr) {
        setVolume(parseInt(volumeStr));
      }
    });
  }, []);

  const setInputVolume = useCallback(async (volume: number) => {
    exec(`amixer -D pulse sset Capture ${volume}%`, (error, stdout, stderr) => {
      if (error) {
        message.failure("设置系统输入音量失败。", error);
      }
      if (stderr) {
        message.failure("设置系统输入音量失败。", stderr);
      }
      // console.log("设置系统输入音量结果：", stdout);
      setVolume(volume);
    });
  }, []);

  return (
    <McModalNice
      title="信号输入音量 - 调节向导"
      className="mc-audio-volumn-wizard"
      visible
      centered
      width={720}
      onCancel={onClose}
      footer={
        <div>
          <McButton type="primary" size="large" onClick={onClose}>
            关闭
          </McButton>
        </div>
      }
    >
      <div className="wizard-main">
        <div className="wizard-tip">
          信号音量调节向导：调整收报信号输入音量以获取稳定的解码效果。
        </div>
        <div className="wizard-tip">
          确保对方持续发送等幅报信号。拖动下方滑块，调整信号输入音量，使得:
        </div>
        <div className="wizard-tip wizard-tip-2">
          * 音量图中的信号波形介于红线和绿线区域之间
          <br />* 底噪波形位于绿线范围内。
        </div>
        <div className="wizard-freq-wrapper">
          <div className="wizard-freq-view" id={`mc-${guid}`}></div>
          <div className="guideline guideline-max-top"></div>
          <div className="guideline guideline-min-top"></div>
          <div className="guideline guideline-min-bottom"></div>
          <div className="guideline guideline-max-bottom"></div>
        </div>
        <div className="wizard-control">
          <div className="volume-control">
            <Slider
              value={volume}
              max={100}
              marks={{ 0: "静音", 50: "50%", 100: "100%(0db)", 153: "max(11db)" }}
              step={1}
              onChange={value => {
                let _number = parseInt(value);
                if (_number > 100) {
                  _number = 100;
                }
                setInputVolume(_number);
              }}
            />
          </div>
          <div className="volume-display">
            信号输入音量：
            <InputNumber
              size="large"
              value={volume}
              onChange={value => {
                setInputVolume(value > 100 ? 100 : value);
              }}
            />
            %
          </div>
        </div>
      </div>
    </McModalNice>
  );
};

export default McAudioVolumnWizard;

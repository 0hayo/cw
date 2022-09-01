import "./index.less";
import React, { FC, useState } from "react";
import { Popover } from "antd";
import McBox from "components/mc-box";
import McButton from "components/mc-button";
import McIcon from "components/mc-icon";
import {
  signalDetectionSnrThreshold,
  signalDetectionAmplitudeThreshold,
  defaultFrequency,
} from "misc/env";
import useTuner from "./useTuner";

interface IProps {
  ready: boolean;
}

const McPhyStatusTuner: FC<IProps> = ({ ready = false }) => {
  const tuner = useTuner(ready);
  const [snr, setSnr] = useState<string | number>(tuner.defSnr);
  const [amp, setAmp] = useState<string | number>(tuner.defAmp);
  const [freq, setFreq] = useState<string | number>(tuner.defFreq);
  const [show, setShow] = useState(false);

  const panel = (
    <McBox display="flex" flexDirection="column" className="mc-pystatus-tuner">
      <div>
        <div>信噪比(SNR)调节:</div>
        <McBox className="mc-pystatus-tuner__status">
          预设:
          <span className="mc-pystatus-tuner__preset">
            {signalDetectionSnrThreshold}
          </span>
          动态: <span className="mc-pystatus-tuner__dynamic">{tuner.snr}</span>
          &nbsp;&nbsp; 调整：
          <input
            className="mc-pystatus-tuner__tuning"
            defaultValue={tuner.defSnr}
            onChange={event => setSnr(event.target.value)}
          />
        </McBox>
      </div>
      <div>
        <div>信号强度(AMP)调节:</div>
        <McBox className="mc-pystatus-tuner__status">
          预设:
          <span className="mc-pystatus-tuner__preset">
            {signalDetectionAmplitudeThreshold}
          </span>
          动态: <span className="mc-pystatus-tuner__dynamic">{tuner.amp}</span>
          &nbsp;&nbsp; 调整：
          <input
            className="mc-pystatus-tuner__tuning"
            defaultValue={tuner.defAmp}
            onChange={event => setAmp(event.target.value)}
          />
        </McBox>
      </div>
      <div>
        <div>频率(Hz)调节:</div>
        <McBox className="mc-pystatus-tuner__status">
          预设:
          <span className="mc-pystatus-tuner__preset">{defaultFrequency}</span>
          动态: <span className="mc-pystatus-tuner__dynamic">{tuner.freq}</span>
          &nbsp;&nbsp; 调整：
          <input
            className="mc-pystatus-tuner__tuning"
            defaultValue={tuner.defFreq}
            onChange={event => setFreq(event.target.value)}
          />
        </McBox>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "40% 60%" }}>
        <div>
          信号状态：
          <McIcon color={tuner.signal ? "green" : "gray"}>voice</McIcon>
          {tuner.signal ? "有" : "无"}
        </div>
        <div style={{ textAlign: "right" }}>
          <McButton
            danger
            icon="rotate"
            type="primary"
            size="small"
            onClick={() => {
              setSnr(tuner.defSnr);
              setAmp(tuner.defAmp);
              setFreq(tuner.defFreq);
              tuner.submit(snr, amp, freq);
            }}
          >
            重置
          </McButton>
          <McButton
            icon="cluster"
            type="primary"
            size="small"
            onClick={() => tuner.submit(snr, amp, freq)}
          >
            提交
          </McButton>
        </div>
      </div>
    </McBox>
  );

  return (
    <Popover
      placement="bottom"
      title="收报参数调谐"
      content={panel}
      trigger="click"
      visible={show}
    >
      <div className="btn-tuner" onClick={() => setShow(!show)}>
        <McIcon>format</McIcon>
      </div>
    </Popover>
  );
};

export default McPhyStatusTuner;

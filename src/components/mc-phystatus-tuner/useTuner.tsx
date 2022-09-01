import { useCallback, useEffect, useState } from "react";
import message from "misc/message";
import {
  signalDetectionSnrThreshold,
  signalDetectionAmplitudeThreshold,
  defaultFrequency,
} from "misc/env";
import exec from "services/exec";

const useTuner = (
  ready: boolean
): {
  submit: (snr: string | number, amp: string | number, freq: string | number) => void;
  defSnr: number;
  defAmp: number;
  defFreq: number;
  snr: number;
  amp: number;
  freq: number;
  signal: boolean;
} => {
  const defSnr = signalDetectionSnrThreshold;
  const defAmp = signalDetectionAmplitudeThreshold;
  const defFreq = defaultFrequency;
  const [snr, setSnr] = useState(0);
  const [amp, setAmp] = useState(0);
  const [freq, setFreq] = useState(0);
  const [signal, setSignal] = useState(false);

  useEffect(() => {
    ready &&
      exec("monitor", {
        onData: payload => {
          if (payload.tag === "PhyStatus") {
            setSnr(Math.round(payload.snr * 100) / 100);
            setAmp(Math.round(payload.amp));
            setFreq(Math.round(payload.freq));
            setSignal(payload.signalDetected);
          }
        },
        onError: () => {
          message.failure("物理参数监控", "连接错误。");
        },
        onClose: () => {},
      });
  }, [ready]);

  const submit = useCallback(
    async (snr: string | number, amp: string | number, freq: string | number) => {
      if (isNaN(parseFloat(snr as string))) {
        message.failure("设置物理层参数", "SNR必须为有效的数值。");
        return;
      }
      if (isNaN(parseFloat(amp as string))) {
        message.failure("设置物理层参数", "AMP必须为有效的数值。");
        return;
      }
      if (isNaN(parseFloat(freq as string))) {
        message.failure("设置物层理参数", "频率必须为有效的数值。");
        return;
      }
      const phystatus = {
        tag: "PhyStatus",
        snr: parseFloat(snr as string),
        amp: parseFloat(amp as string),
        freq: parseFloat(freq as string),
      };
      const data = JSON.stringify(phystatus);

      exec(`runjson -json ${data}`, {
        onData: payload => {
          if (payload && ("Error" === payload.tag || payload.rc !== 0)) {
            message.failure("物理层参数设置", "设置失败:" + payload.message);
          } else {
            message.success("物理层参数设置", "设置成功。");
          }
        },
        onError: () => {
          message.failure("物理层参数设置", "连接错误。");
        },
        onClose: () => {},
      });
    },
    []
  );

  return {
    submit,
    defSnr,
    defAmp,
    defFreq,
    snr,
    amp,
    freq,
    signal,
  };
};

export default useTuner;

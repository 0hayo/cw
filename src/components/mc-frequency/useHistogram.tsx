// import useMounted from "hooks/useMounted";
import { useCallback, useMemo, useRef } from "react";

import Recorder from "recorder-core";
import {} from "recorder-core/src/extensions/lib.fft";

import FrequencyHistogramView from "recorder-core/src/extensions/frequency.histogram.view";
import {} from "recorder-core/src/extensions/frequency.histogram.view";
import {} from "recorder-core/src/engine/pcm";

const PCM_SAMPLE_RATE = 6000;

const useHistogram = (
  elemId: string
): {
  feed: (data: Buffer) => void;
  start: () => void;
  stop: () => void;
} => {
  const canvasRef = useRef<FrequencyHistogramView>();
  const recordRef = useRef<any>();
  const el = document.getElementById(elemId);
  // const mounted = useMounted();

  const config = useMemo(() => ({ elem: el, width: 300, height: 60 }), [el]);

  // useEffect(() => {
  //   if(!mounted.current) return;
  //   const wave = Recorder.FrequencyHistogramView(config);
  //   var rec = Recorder({
  //     type: "wav",
  //     onProcess:function(buffers,powerLevel, bufferDuration, bufferSampleRate){
  //       if(buffers) {
  //         wave.input(buffers[buffers.length - 1], powerLevel, bufferSampleRate);//输入音频数据，更新显示波形
  //       }
  //     }
  //   });
  //   rec.open(function(){
  //       rec.start();
  //   });

  //   canvasRef.current = wave;

  // },[config, mounted]);

  const feed = useCallback((data: Buffer) => {
    canvasRef.current && canvasRef.current.input(data, 100, PCM_SAMPLE_RATE);
  }, []);

  const start = useCallback(() => {
    canvasRef.current = Recorder.FrequencyHistogramView(config);
    recordRef.current = Recorder({
      type: "pcm",
      audioTrackSet: {
        deviceId: "",
        groupId: "",
        autoGainControl: false,
        echoCancellation: true,
        noiseSuppression: true,
      },
      onProcess: function (buffers, powerLevel, bufferDuration, bufferSampleRate) {
        if (buffers) {
          canvasRef.current.input(buffers[buffers.length - 1], powerLevel, bufferSampleRate); //输入音频数据，更新显示波形
        }
      },
    });
    recordRef.current &&
      recordRef.current.open(function () {
        recordRef.current.start();
      });
  }, [config]);

  const stop = useCallback(() => {
    recordRef.current && recordRef.current.stop();
    recordRef.current && recordRef.current.close();
  }, []);

  return { feed, start, stop };
};

export default useHistogram;

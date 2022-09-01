// import useMounted from "hooks/useMounted";
import { MstTheme } from "less/theme";
import { useCallback, useMemo, useRef } from "react";

import Recorder from "recorder-core";
import {} from "recorder-core/src/extensions/lib.fft";

import WaveSurferView from "recorder-core/src/extensions/wavesurfer.view";
import {} from "recorder-core/src/extensions/wavesurfer.view";
import {} from "recorder-core/src/engine/pcm";

const PCM_SAMPLE_RATE = 6000;

const useWaveSurfer = (
  elemId: string
): {
  feed: (data: Buffer) => void;
  start: () => void;
  stop: () => void;
} => {
  const canvasRef = useRef<WaveSurferView>();
  const recordRef = useRef<any>();
  const el = document.getElementById(elemId);
  // const mounted = useMounted();

  const configSurfer = useMemo(
    () => ({
      elem: el,
      width: 300, //显示宽度
      height: 60, //显示高度
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
    }),
    [el]
  );

  // useEffect(() => {
  //   if(!mounted.current) return;

  //   const wave = Recorder.WaveSurferView(configSurfer);

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

  //   recordRef.current = rec;
  //   canvasRef.current = wave;

  //   // const configWave = {
  //   //   elem: el,
  //   //   width: 300, //显示宽度
  //   //   height: 80, //显示高度
  //   //   //以上配置二选一
  //   //   scale: 2, //缩放系数，应为正整数，使用2(3? no!)倍宽高进行绘制，避免移动端绘制模糊
  //   //   speed: 40, //移动速度系数，越大越快
  //   //   lineWidth: 3, //线条基础粗细
  //   //   //渐变色配置：[位置，css颜色，...] 位置: 取值0.0-1.0之间
  //   //   linear1: [0,"rgba(150,96,238,1)",0.2,"rgba(170,79,249,1)",1,"rgba(53,199,253,1)"], //线条渐变色1，从左到右
  //   //   linear2: [0,"rgba(209,130,255,0.6)",1,"rgba(53,199,255,0.6)"], //线条渐变色2，从左到右
  //   //   linearBg: [0,"rgba(255,255,255,0.2)",1,"rgba(54,197,252,0.2)"], //背景渐变色，从上到下
  //   // };

  //   // const wave = Recorder.WaveView(configWave);

  // },[configSurfer, mounted]);

  const feed = useCallback((data: Buffer) => {
    canvasRef.current && canvasRef.current.input(data, 100, PCM_SAMPLE_RATE);
  }, []);

  const start = useCallback(() => {
    canvasRef.current = Recorder.WaveSurferView(configSurfer);
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
  }, [configSurfer]);

  const stop = useCallback(() => {
    recordRef.current && recordRef.current.stop();
    recordRef.current && recordRef.current.close();
  }, []);

  return { feed, start, stop };
};

export default useWaveSurfer;

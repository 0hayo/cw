import { useState, useEffect } from "react";
import { Modal } from "antd";
import draw from "./draw";

const useAudio = (guid: string): boolean => {
  const [audio, setAudio] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: { autoGainControl: false },
        video: false,
      })
      .then(
        stream => {
          const canvas = document.getElementById(`mc-${guid}`) as HTMLCanvasElement;
          if (canvas) {
            setAudio(true);
            draw(stream, canvas);
          }
        },
        () => {
          Modal.error({
            title: "发生错误",
            content: "获取音频失败",
          });
        }
      );
  }, [guid]);

  return audio;
};

export default useAudio;

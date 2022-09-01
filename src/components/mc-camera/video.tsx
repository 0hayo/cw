import React, { FC, useEffect, useState } from "react";
import McCameraPicker from "components/mc-camera-picker";
import message from "misc/message";
import useMounted from "hooks/useMounted";

interface IProps {
  uuid: string;
  scale: number;
  rotate: number;
  containerW: number;
}

// const fixW = 490;
// const fixH = 700;

const Video: FC<IProps> = ({ uuid, scale, rotate, containerW }) => {
  const [deviceId, setDeviceId] = useState("");
  const mounted = useMounted();

  const [videoStyle, setVideoStyle] = useState({
    transform: `rotate(${rotate}deg) scale(${scale})`,
  });

  const [defaultLabel, setDefaultLabel] = useState("默认摄像头");
  const [frameHeight, setFrameHeight] = useState(800);

  // const [frameMargin, setFrameMargin] = useState(20);

  useEffect(() => {
    let media: MediaStream;
    const video = document.getElementById(uuid) as HTMLVideoElement;
    let label = "";

    const constraints = {
      // width: { min: 1920, ideal: 1920 },
      // height: { min: 1200, ideal: 1200 },
      // advanced: [{ width: 4896, height: 3264 }, { aspectRatio: 1.5 }], //新款高拍仪适配（待验证）
      // advanced: [{ width: 2880, height: 1920 }, { aspectRatio: 1.5 }], //老款高拍仪适配
      advanced: [{ width: 1600, height: 1000 }, { aspectRatio: 1.6 }], //逊镭高拍仪适配
      // advanced: [{ width: 1920, height: 1200 }, { aspectRatio: 1.414 }], //得力高拍仪适配（战支）
    };

    window.navigator.mediaDevices
      .getUserMedia({
        video: { deviceId: deviceId },
        audio: false,
      })
      .then(
        stream => {
          label = stream.getVideoTracks()[0].label;
          console.log("video device label====", label);
          const mediaStreamTrack = stream.getVideoTracks()[0];
          mediaStreamTrack.applyConstraints(constraints);
          media = stream;
          video.srcObject = stream;
          video.play();
          setDefaultLabel(label);
        },
        () => {
          // Modal.error({
          //   title: "发生错误",
          //   content: "获取相机失败",
          // });
          message.failure("错误", "获取相机失败");
        }
      );

    // close the camera when component unloaded.
    return () => {
      if (media) {
        media.getTracks().map(it => it.stop());
      }
    };
  }, [deviceId, defaultLabel, uuid]);

  useEffect(() => {
    if (!mounted.current) return;
    const newStyle = {
      transform: `rotate(${rotate}deg) scale(${scale})`,
    };
    setVideoStyle(newStyle);
  }, [scale, rotate, mounted]);

  // useEffect(() => {
  //   setFrameMargin((containerW - fixW) / 2);
  // }, [containerW]);

  /** 动态设置校准框的宽度 */
  useEffect(() => {
    const el = document.getElementById(`mc-camera-frame-${uuid}`);
    if (el) {
      const frameWidth = el.clientWidth;
      setFrameHeight(frameWidth * scale);
    }
  }, [scale, uuid]);

  return (
    <>
      <div className="camera-wrapper">
        <div className="camera-picker">
          <McCameraPicker deviceName={defaultLabel} onChange={setDeviceId} />
        </div>
        <div
          id={`mc-camera-frame-${uuid}`}
          className="camera-frame"
          style={{ height: frameHeight }}
        >
          <div className="camera-frame-y" />
          <div className="camera-frame-x" />
          <div className="camera-frame-y" />
        </div>
        <div className="camera-canvas">
          <video id={uuid} className="camera-canvas-video" style={videoStyle} />
        </div>
      </div>
    </>
  );
};

export default Video;

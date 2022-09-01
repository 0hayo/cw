import { useState, useEffect } from "react";
// import message from "misc/message";
// import exec from "services/exec";

interface Devices {
  radio: boolean;
  audio: boolean;
  camera: boolean;
}

const kInit: Devices = {
  audio: false,
  radio: false,
  camera: false,
};

const useMonitor = (): {
  devices: Devices;
  refresh: (manual: boolean) => void;
} => {
  const [connect, setConnect] = useState(0);
  const [devices, setDevices] = useState<Devices>(kInit);
  const [manual, setManual] = useState(false); //是否手动点击

  useEffect(() => {
    let audio = false;
    let radio = false;
    let camera = false;
    // const socket = exec("status", {
    //   onData: payload => {
    //     audio = payload.headPhone;
    //     radio = payload.radioStation;
    //     setDevices({
    //       audio: audio,
    //       radio: radio,
    //       camera: camera, //摄像头状态由UI端获取
    //     });
    //   },
    //   onError: () => {
    //     audio = false;
    //     radio = false;
    //     setDevices({
    //       audio: audio,
    //       radio: radio,
    //       camera: camera, //摄像头状态由UI端获取
    //     });
    //     if (manual) {
    //       message.failure("设备状态", "连接错误");
    //     }
    //   },
    //   onClose: () => {
    //     audio = false;
    //     radio = false;
    //     setDevices({
    //       audio: audio,
    //       radio: radio,
    //       camera: camera, //摄像头状态由UI端获取
    //     });
    //   },
    // });
    //检测摄像头
    navigator.mediaDevices[0]?.getUserMedia(
      {
        video: true,
        audio: false,
      },
      //on Success
      stream => {
        camera = true;
        setDevices({
          audio: audio,
          radio: radio,
          camera: camera,
        });
        stream.getVideoTracks()[0].stop();
      },
      //on error
      err => {
        // console.error("检测摄像头失败：", err);
        camera = false;
        setDevices({
          audio: audio,
          radio: radio,
          camera: camera,
        });
      }
    );

    //此种方式只能检测到设备是否存在，但是不能检测设备是否可用
    // navigator.mediaDevices.enumerateDevices()
    // .then( _devices => {
    //   _devices.forEach(function (device) {
    //     if (device.kind === "videoinput") {
    //       camera = true;
    //       setDevices({
    //         audio : audio,
    //         radio : radio,
    //         camera: camera,
    //       });
    //     }
    //   });
    // }).catch( err => {
    //   console.error(err.name + ": " + err.message);
    //   camera = false;
    //   setDevices({
    //     audio : audio,
    //     radio : radio,
    //     camera: camera,
    //   });
    // });

    // return () => socket.end();
    // eslint-disable-next-line
  }, [connect, manual]);

  const refresh = (click: boolean) => {
    setManual(click);
    setConnect(connect + 1);
  };

  return {
    devices,
    refresh,
  };
};

export default useMonitor;

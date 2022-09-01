import "./index.less";
import React, { FC, useEffect, useState } from "react";
import useGuid from "hooks/useGuid";
import useWaveSurfer from "./useWaveSurfer";
// import usePCMSocket from "./usePCMSocket";
import useHistogram from "./useHistogram";
import { SwapOutlined, SettingFilled } from "@ant-design/icons";
import McAudioVolumnWizard from "./audio-volum-wizard";

interface IProps {
  view?: "waveSurfer" | "histogram";
  setting?: boolean; //显示音量调节设置按钮
  swap?: boolean; //显示切换按钮
}

const McFrequencyView: FC<IProps> = ({ view = "histogram", setting = false, swap = true }) => {
  const guid1 = useGuid();
  const guid2 = useGuid();

  const [viewType, setViewType] = useState<"waveSurfer" | "histogram">(view);
  const { start: startSurfer, stop: stopSurfer } = useWaveSurfer(`mc-${guid1}`);
  const { start: startHistogram, stop: stopHistogram } = useHistogram(`mc-${guid2}`);

  const [wizard, setWizard] = useState(false);
  // useWaveSurfer(`mc-${guid1}`);
  // useHistogram(`mc-${guid2}`);

  // usePCMSocket(buffer => {
  //   if(!play) return;
  //   if(viewType === "histogram") {
  //     feedHistogram(buffer);
  //   } else {
  //     feedSurfer(buffer);
  //   }
  // });

  useEffect(() => {
    if (viewType === "histogram") {
      stopSurfer();
      startHistogram();
    } else {
      stopHistogram();
      startSurfer();
    }
  }, [viewType, startHistogram, stopHistogram, startSurfer, stopSurfer]);

  return (
    <div className="mc-frequency">
      <div
        className="view-container"
        style={viewType === "waveSurfer" ? {} : { display: "none" }}
        id={`mc-${guid1}`}
      ></div>
      <div
        className="view-container"
        style={viewType === "histogram" ? {} : { display: "none" }}
        id={`mc-${guid2}`}
      ></div>
      <div className="control-btns">
        <SwapOutlined
          onClick={() => {
            if (viewType === "histogram") {
              setViewType("waveSurfer");
            } else {
              setViewType("histogram");
            }
          }}
        />
        {setting && <SettingFilled title="音量设置向导" onClick={() => setWizard(!wizard)} />}
      </div>
      {wizard && <McAudioVolumnWizard onClose={() => setWizard(false)} />}
    </div>
  );
};

export default McFrequencyView;

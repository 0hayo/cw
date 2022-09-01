import "./index.less";
import React, { FC, useState } from "react";
import useGuid from "hooks/useGuid";
import useAudio from "./useAudio";
import { SettingFilled } from "@ant-design/icons";
import McAudioVolumnWizard from "./audio-volum-wizard";

const McFrequency: FC = () => {
  const guid = useGuid();
  useAudio(guid);
  const [wizard, setWizard] = useState(false);

  return (
    <div className="mc-frequency">
      <canvas id={`mc-${guid}`} className="mc-frequency__canvas" />
      <div className="control-btns">
        <SettingFilled title="音量设置向导" onClick={() => setWizard(!wizard)} />
      </div>
      {wizard && <McAudioVolumnWizard onClose={() => setWizard(false)} />}
    </div>
  );
};

export default McFrequency;

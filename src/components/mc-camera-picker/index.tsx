import "./index.less";
import { Dropdown } from "antd";
import React, { FC, useEffect, useState } from "react";
import classnames from "classnames";
import McIcon from "components/mc-icon";
import McButton from "components/mc-button";

interface IProps {
  deviceName: string;
  onChange: (name: string) => void;
}

const McCameraPicker: FC<IProps> = ({ deviceName, onChange }) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentName, setCurrentName] = useState<string>();

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(function (_devices) {
        const useful: MediaDeviceInfo[] = [];
        _devices.forEach(function (device) {
          if (device.kind === "videoinput") {
            if (device.label === deviceName) {
              setCurrentName(device.label);
            }
            useful.push(device);
          }
        });
        setDevices(useful);
      })
      .catch(function (err) {
        console.error(err.name + ": " + err.message);
      });
  }, [deviceName]);

  const overlay = (
    <div className="mc-camera-picker__overlay">
      <div className="mc-camera-picker__head">
        <span>选择拍照设备</span>
        <McIcon size="18px">close</McIcon>
      </div>
      <ul>
        {devices.map(it => (
          <li
            key={it.deviceId}
            className={classnames("mc-camera-picker__item", {
              "mc-camera-picker__item--active": it.label === currentName,
            })}
            onClick={() => onChange(it.deviceId)}
          >
            {it.label}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Dropdown overlay={overlay} trigger={["click"]} placement="topLeft">
      <div className="mc-camera-picker">
        <McButton icon="camera" className="mc-camera-picker__button">
          {currentName}
        </McButton>
      </div>
    </Dropdown>
  );
};

export default McCameraPicker;

import React, { FC, useState, useEffect } from "react";
import McIcon from "components/mc-icon";
import si from "systeminformation";
import { ipcRenderer } from "electron";

const McHwMonitor: FC = () => {
  const [cpuTemperature, setCpuTemperature] = useState(50);
  const [devTemperature, setDevTemperature] = useState(30);

  //监测CPU温度
  useEffect(() => {
    const getCpuInof = () => {
      si.cpuTemperature().then(data => {
        setCpuTemperature(Math.round(data.main));
      });
    };

    const j = setInterval(getCpuInof, 3000);

    return () => {
      clearInterval(j);
    };
  }, []);

  //监测腔体温度
  useEffect(() => {
    //收到主进程送来的系统错误日志，要上传服务器
    const listenerSync = (event, type, data) => {
      if (!data || data.length < 1) return;
      if (data && data.length > 0) {
        const _devTemperature = Math.round(data[0].dev_temp);
        setDevTemperature(_devTemperature);
      }
    };
    ipcRenderer.on("newSysCheckData", listenerSync);
    return () => {
      ipcRenderer.removeListener("newSysCheckData", listenerSync);
    };
  }, []);

  return (
    <div className="mc-hw-monitor">
      <div className="cpu-temperature">
        <McIcon>cpu-temperature</McIcon>
        <div className="temperature-title">CPU温度:</div>
        <div className="temperature-value">{cpuTemperature}℃</div>
      </div>
      <div className="device-temperature">
        <McIcon>device-temperature</McIcon>
        <div className="temperature-title">腔体温度:</div>
        <div className="temperature-value">{devTemperature}℃</div>
      </div>
    </div>
  );
};

export default McHwMonitor;

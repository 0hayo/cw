import "./index.less";
import React, { FC, useState } from "react";
import { saveConfig, loadConfig } from "misc/env";
import { Input } from "antd";
import McButton from "components/mc-button";

const SystemParametersSetting: FC = () => {
  const [config, setConfig] = useState(loadConfig());

  // const [hiddenKey, setHiddenKey] = useState("");

  const [tab, setTab] = useState({
    tab: "sence",
    add: false,
  });

  // useEffect(() => {
  //   const listener = (e: KeyboardEvent) => {
  //     if (e.key === "Escape") {
  //       // setHiddenKey("");
  //     } else {
  //       // setHiddenKey(x => x + e.key);
  //     }
  //   };
  //   window.addEventListener("keydown", listener);
  //   return () => {
  //     window.removeEventListener("keydown", listener);
  //   };
  // }, []);

  // 切换tab
  const switchTabbar = e => {
    if (e === tab.tab) return;
    setTab(x => ({
      ...x,
      tab: e,
    }));
  };

  return (
    <>
      <div className="parameter_title">
        <div
          className={`parameter_title_text ${tab.tab === "sence" ? "active" : null}`}
          onClick={() => switchTabbar("sence")}
        >
          连接参数
        </div>
        {/* <div
          className={`parameter_title_text ${tab.tab === "rxtx" ? "active" : null}`}
          onClick={() => switchTabbar("rxtx")}
        >
          收发报参数
        </div> */}
      </div>
      <div className="system-parameter-setting">
        <div className="setting-body">
          <div className="setting-panel">
            {/* <div className="setting-row">
              <div className="setting-title">应用场景：</div>
              <div className="setting-value">
                <Select
                  value={config.localUse ? "local" : "online"}
                  onChange={value => {
                    const localUse = value === "local" ? true : false;
                    //（尝试）通知总控服务器本机脱网/联网
                    const cmd: Command = {
                      cmd: "rtRadioOffLine",
                      radioUuid: LOCAL_MACHINE_ID,
                      data: {
                        mode: localUse ? "on" : "off",
                      },
                    };
                    setConfig(x => ({ ...x, localUse: localUse }));
                    saveConfig({ ...config, localUse: localUse });
                    window.location.reload();
                  }}
                >
                  <Select.Option value="online">遥控专网终端</Select.Option>
                  <Select.Option value="local">本地桌面终端</Select.Option>
                </Select>
              </div>
            </div> */}
            <div className="setting-row">
              <div className="setting-title">等幅报服务地址：</div>
              <div className="setting-value">
                <Input
                  value={config.bizServerAddress}
                  placeholder="192.168.100.10"
                  onChange={e => {
                    e.persist();
                    setConfig(x => ({ ...x, bizServerAddress: e.target.value }));
                  }}
                />
                <McButton
                  type="primary"
                  onClick={() => {
                    saveConfig(config);
                    window.location.reload();
                  }}
                >
                  保存
                </McButton>
              </div>
            </div>
            {/* <div className="setting-row">
              <div className="setting-title">总控服务器HTTP端口：</div>
              <div className="setting-value">
                <InputNumber
                  value={config.bizServerHttpPort}
                  precision={0}
                  onChange={value => {
                    setConfig(x => ({ ...x, bizServerHttpPort: value }));
                  }}
                />
                <McButton
                  type="primary"
                  onClick={() => {
                    saveConfig(config);
                    window.location.reload();
                  }}
                >
                  保存
                </McButton>
              </div>
            </div> */}
          </div>
          <div className="setting-panel"></div>
        </div>
      </div>
    </>
  );
};

export default SystemParametersSetting;

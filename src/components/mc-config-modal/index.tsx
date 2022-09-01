import "./index.less";
import React, { FC, useCallback, useEffect, useState } from "react";
import { Checkbox, Input, Layout, message, Tooltip } from "antd";
import { saveConfig, loadConfig, getAppType } from "misc/env";
import { QuestionCircleFilled, SettingFilled } from "@ant-design/icons";
import { MstTheme } from "less/theme";
import { isIPv4 } from "net";
import McModalNice from "components/mc-modal-nice";
import McButton from "components/mc-button";
// import MstContext from "containers/mst-context/context";

const savedCfg = loadConfig();

const McConnectionConfigModal: FC = () => {
  const appType = getAppType();
  const [config, setConfig] = useState<_1T6Config>(savedCfg);
  const [tempVal, setTempVal] = useState(savedCfg.bizServerAddress);
  const [display, setDisplay] = useState(true);
  const [localService, setLocalService] = useState(savedCfg.localUse);

  const [showInput, setShowInput] = useState(false);

  const connect = useCallback(() => {
    if (!localService && appType !== "single" && !isIPv4(tempVal)) {
      message.error("请输入有效的IP地址");
      return;
    }

    saveConfig({ ...config, bizServerAddress: tempVal });
    setDisplay(false);
    window.location.reload();
  }, [config, tempVal, localService, appType]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        connect();
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [connect]);

  return (
    <McModalNice
      title={appType === "single" ? "请检查服务模块" : "连接配置"}
      visible={display}
      width={540}
      mask={false}
      footer={false}
      closable={true}
      destroyOnClose={true}
      maskClosable={false}
      wrapClassName="mc-config-modal-wrapper"
      className="mc-config-modal"
      style={{ marginTop: -32 }}
      centered
      onCancel={() => setDisplay(false)}
    >
      <Layout className="mc-layout">
        <div style={{ height: "100%", textAlign: "center" }}>
          <div className="config-form">
            <span className={`title-text ${localService ? "gray-text" : ""}`}>
              {appType === "single" ? "无法连接服务模块 " : "连接到总控服务器 "}
              {appType === "single" && <SettingFilled onClick={() => setShowInput(x => !x)} />}
              {appType === "terminal" && (
                <Tooltip
                  title={
                    <>
                      <div>
                        出现此页面，可能是本程序第一次运行，需配置总控端服务器的地址；
                        <br />
                      </div>
                      <div>
                        或者现在无法连接到服务器，请检查服务器是否启动，或者检查网络是否连接；
                        <br />
                      </div>
                      <div>您也可以选择“脱网模式“使用本系统，但所有数据都只能保存在本地。</div>
                    </>
                  }
                >
                  <QuestionCircleFilled
                    style={{
                      color: localService ? MstTheme.mc_grey_color : MstTheme.mc_warning_color,
                      cursor: "pointer",
                    }}
                  />
                </Tooltip>
              )}
            </span>
            {appType === "single" && !showInput && (
              <div className="tip-text">未能连接到服务模块，请检查。</div>
            )}
            {showInput && (
              <div
                className="form-line"
                style={{
                  height: 48,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                服务器地址：
                <Input
                  type="text"
                  // defaultValue={config.bizServerAddress}
                  value={config.bizServerAddress}
                  style={{ width: 200, padding: "4px 8px", textAlign: "left" }}
                  placeholder="请输入服务器IP地址"
                  onChange={e => {
                    setConfig({ ...config, bizServerAddress: e.target.value });
                    setTempVal(e.target.value);
                  }}
                />
              </div>
            )}
            {appType !== "single" && (
              <>
                {localService ? (
                  <div className="form-line" style={{ height: 48 }}>
                    {" "}
                  </div>
                ) : (
                  <div
                    className="form-line"
                    style={{
                      height: 48,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    服务器地址：
                    <Input
                      type="text"
                      // defaultValue={config.bizServerAddress}
                      value={config.bizServerAddress}
                      style={{ width: 200, padding: "4px 8px", textAlign: "left" }}
                      placeholder="请输入服务器IP地址"
                      onChange={e => {
                        setConfig({ ...config, bizServerAddress: e.target.value });
                        setTempVal(e.target.value);
                      }}
                    />
                    {/* : */}
                    {/* <Input
                      type="number"
                      defaultValue={config.bizServerHttpPort}
                      placeholder="请输入服务器HTTP端口"
                      onChange={e =>
                        setConfig({ ...config, bizServerHttpPort: parseInt(e.target.value) })
                      }
                      style={{ width: 100, padding: "4px 16px" }}
                    /> */}
                  </div>
                )}
                <div className="form-line">
                  {appType === "terminal" && (
                    <Checkbox
                      className="local-service-check"
                      checked={localService}
                      onChange={e => {
                        setLocalService(e.target.checked);
                        setConfig({ ...config, localUse: e.target.checked });
                        saveConfig({ ...config, localUse: e.target.checked });
                      }}
                    >
                      脱网模式
                    </Checkbox>
                  )}
                </div>
              </>
            )}
            {/* <div className="form-line">
              <div style={{ width: 360, padding: "4px 8px", textAlign: "right" }}>
                服务器控制端口:
              </div>
              <Input
                type="number"
                defaultValue={config.bizServerSocketPort}
                style={{ width: 100, padding: "4px 8px" }}
                placeholder="请输入服务器控制端口"
                onChange={e =>
                  setConfig({ ...config, bizServerSocketPort: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="form-line">
              <div style={{ width: 360, padding: "4px 8px", textAlign: "right" }}>
                服务器音频输入端口:
              </div>
              <Input
                type="number"
                defaultValue={config.audioSendSocketPort}
                style={{ width: 100, padding: "4px 8px" }}
                placeholder="请输入音频输入端口"
                onChange={e =>
                  setConfig({ ...config, audioSendSocketPort: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="form-line">
              <div style={{ width: 360, padding: "4px 8px", textAlign: "right" }}>
                服务器音频输出端口:
              </div>
              <Input
                type="number"
                defaultValue={config.audioRecvSocketPort}
                style={{ width: 100, padding: "4px 8px" }}
                placeholder="请输入音频输出端口"
                onChange={e =>
                  setConfig({ ...config, audioRecvSocketPort: parseInt(e.target.value) })
                }
              />
            </div> */}
            <span>
              <McButton
                type="primary"
                style={{ width: 160, height: 36, fontSize: 18, fontWeight: 700 }}
                onClick={() => {
                  connect();
                }}
              >
                {appType === "single" && !showInput ? "服务模块已启动" : "确定"}
              </McButton>
            </span>
          </div>
        </div>
      </Layout>
    </McModalNice>
  );
};

export default McConnectionConfigModal;

import "./index.less";
import React, { FC, useContext, useState } from "react";
import { Button, Input, Layout } from "antd";
import Modal from "components/mc-modal";
import MstContext from "containers/mst-context/context";
import { LOCAL_MACHINE_ID, LOCAL_NET_IP } from "misc/env";
import useCmdSender from "socket/command-sender";
import useCmdAckHandler from "./useCmdAckHandler";
import { WarningFilled } from "@ant-design/icons";
import message from "misc/message";

const McConfigTerminalModal: FC = () => {
  const [display, setDisplay] = useState(true);
  const { appType } = useContext(MstContext);
  const [radioUuid] = useState<string>(LOCAL_MACHINE_ID);
  const [radioIp, setRadioIp] = useState<string>(LOCAL_NET_IP);

  const [radioName, setRadioName] = useState<string>("短波业务处理终端");
  const [radioCode, setRadioCode] = useState<string>("10001");

  const send = useCmdSender();
  const processCmdAck = (ackData: AckData) => {
    const cmd = ackData.cmd;
    // alert(cmd);
    switch (cmd) {
      case "rtRadioRegist-ack":
        setDisplay(false);
        if (ackData.rc === -1) {
          // setConfigFlag(true);
          message.failure("注册失败", "终端注册失败，请检查网络或联系管理员。");
        } else {
          message.success("注册已提交", ackData.message, false, 8);
        }
        break;
      default:
      //do nothing
    }
  };
  useCmdAckHandler(processCmdAck);

  return (
    <Modal
      title={appType === "single" ? "启动服务模块" : "终端注册"}
      visible={display}
      width={720}
      mask={false}
      footer={false}
      closable={false}
      destroyOnClose={true}
      maskClosable={false}
      wrapClassName="mc-config-modal-wrapper"
      className="mc-config-modal"
      style={{ marginTop: -32 }}
      centered
    >
      <Layout className="mc-layout">
        <div className="terminal-register" style={{ height: "100%", textAlign: "center" }}>
          <div className="tips">
            <WarningFilled />{" "}
            当前终端未注册。请填写并核对相关信息后提交注册信息，待管理员审核通过后才能接入系统。
          </div>
          <div className="config-form">
            {appType !== "single" && (
              <>
                <div className="form-line"></div>
                <div className="form-line">
                  <div style={{ width: 160, padding: "4px 8px", textAlign: "right" }}>
                    终端机器码:
                  </div>
                  <Input
                    type="text"
                    readOnly
                    // defaultValue={config.bizServerAddress}
                    value={radioUuid}
                    style={{
                      width: 200,
                      padding: "4px 8px",
                      textAlign: "left",
                      cursor: "not-allowed",
                    }}
                    placeholder="终端机器码"
                  />
                </div>
              </>
            )}
            <div className="form-line">
              <div style={{ width: 160, padding: "4px 8px", textAlign: "right" }}>终端IP地址:</div>
              <Input
                type="text"
                defaultValue={LOCAL_NET_IP}
                style={{ width: 200, padding: "4px 8px" }}
                placeholder="终端IP地址"
                onChange={e => {
                  setRadioIp(e.target.value);
                }}
              />
            </div>
            <div className="form-line">
              <div style={{ width: 160, padding: "4px 8px", textAlign: "right" }}>终端名称:</div>
              <Input
                type="text"
                defaultValue={radioName}
                style={{ width: 200, padding: "4px 8px" }}
                placeholder="终端名称"
                onChange={e => {
                  setRadioName(e.target.value);
                }}
              />
            </div>
            <div className="form-line">
              <div style={{ width: 160, padding: "4px 8px", textAlign: "right" }}>终端编号:</div>
              <Input
                type="number"
                defaultValue={radioCode}
                style={{ width: 200, padding: "4px 8px" }}
                placeholder="终端编号"
                onChange={e => {
                  setRadioCode(e.target.value);
                }}
              />
            </div>
            <span>
              <Button
                type="primary"
                style={{ width: 120, height: 36, fontSize: 18, fontWeight: 700 }}
                onClick={() => {
                  // saveConfig(config);
                  // setDisplay(false);
                  const cmd: Command = {
                    cmd: "rtRadioRegist",
                    radioUuid: radioUuid,
                    data: {
                      uuid: radioUuid,
                      name: radioName,
                      code: radioCode,
                      type: "SZT202108181000",
                      ip: radioIp,
                      contactId: 1,
                      libraryVersion: "V1.0",
                    },
                  };
                  send(cmd);
                  // window.location.reload();
                }}
              >
                {appType === "single" ? "服务模块已启动" : "确定"}
              </Button>
            </span>
          </div>
        </div>
      </Layout>
    </Modal>
  );
};

export default McConfigTerminalModal;

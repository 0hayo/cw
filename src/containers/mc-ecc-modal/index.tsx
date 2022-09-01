import "./index.less";
import React, { FC, useState } from "react";
import McModal from "components/mc-modal";
import McButton from "components/mc-button";
import { Radio } from "antd";
import McAlign from "components/mc-align";

interface IProps {
  visible: boolean;
  onCancel: VoidFunction;
  onOK: (role: "head" | "body") => void;
}

const McEccModal: FC<IProps> = ({ visible, onCancel, onOK }) => {
  const [role, setRole] = useState<"head" | "body">("head");

  return (
    <McModal
      width="672px"
      title="请求纠错"
      footer={null}
      visible={visible}
      closable={true}
      onCancel={onCancel}
      maskClosable={false}
      destroyOnClose={true}
      className="mc-ecc-modal"
    >
      <div className="mc-ecc-modal__title">* 请选择纠错码类型并发送</div>
      <Radio.Group
        value={role}
        buttonStyle="outline"
        onChange={event => setRole(event.target.value)}
      >
        <Radio.Button value="head">报头纠错码</Radio.Button>
        <Radio.Button value="body">报文纠错码</Radio.Button>
      </Radio.Group>
      <McAlign align="right">
        <McButton icon="send" type="primary" onClick={() => onOK(role)}>
          确认发送
        </McButton>
      </McAlign>
    </McModal>
  );
};

export default McEccModal;

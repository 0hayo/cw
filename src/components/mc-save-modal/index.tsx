import "./index.less";
import React, { FC } from "react";
import Modal from "components/mc-modal";
import McButton from "components/mc-button";
import { Form, Input } from "antd";

interface IProps {
  name?: string;
  date?: string;
  title?: string;
  visible: boolean;
  datagramType?: string;
  loading?: boolean;
  exit?: boolean;
  send?: boolean; //是否为发报
  finish?: boolean; //是否已发送完成
  onCancel?: VoidFunction;
  onSubmit?: VoidFunction;
  onChange?: (data: string) => void;
  onExit?: () => void;
}

const McSaveModal: FC<IProps> = ({
  name,
  date,
  title,
  visible,
  datagramType,
  exit = true,
  onSubmit,
  onCancel,
  onChange,
  onExit,
  children,
  loading = false,
  send = false,
  finish = false,
}) => {
  const footer = (
    <div>
      {exit && (
        <McButton key="exit" icon="exit" type="primary" danger onClick={onExit}>
          取消
        </McButton>
      )}
      <McButton key="submit" icon="save" type="primary" onClick={onSubmit}>
        确认保存
      </McButton>
    </div>
  );
  return (
    <Modal
      width={672}
      okText="保存"
      title={title}
      visible={visible}
      footer={footer}
      onCancel={onCancel}
      className="mc-tx-save-modal"
      confirmLoading={loading}
      onOk={onSubmit}
    >
      <div className="mc-tx-save-modal__hint">{children}</div>
      <Form layout="vertical">
        <Form.Item required label="报文名称 (必填)">
          <Input
            value={name}
            maxLength={20}
            placeholder="请输入"
            onChange={event => {
              onChange(event.currentTarget.value);
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default McSaveModal;

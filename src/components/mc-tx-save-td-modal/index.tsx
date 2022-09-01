import "./index.less";
import React, { FC } from "react";
import Modal from "components/mc-modal";
import McButton from "components/mc-button";
import { Form, Radio } from "antd";

interface IForm {
  name: string;
  date: string;
  datagramType?: string;
  finish?: boolean;
}

interface IProps {
  name: string;
  date: string;
  title: string;
  visible: boolean;
  datagramType?: string;
  loading?: boolean;
  exit?: boolean;
  send?: boolean; //是否为发报
  finish?: boolean; //是否已发送完成
  onCancel?: VoidFunction;
  onSubmit?: VoidFunction;
  onChange: (data: IForm) => void;
  onExit: () => void;
}

const McSaveTdModal: FC<IProps> = ({
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
  const [value, setValue] = React.useState("CW");
  // const onChangeRadio = e => {
  //   console.log('radio checked', e.target.value);
  //   setValue(e.target.value);
  //   datagramType = value;
  // };

  const footer = (
    <div>
      {exit && (
        <McButton key="exit" icon="exit" type="primary" danger onClick={onExit}>
          不发送
        </McButton>
      )}
      <McButton key="submit" icon="save" type="primary" onClick={onSubmit}>
        开始发送
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
        <Form.Item>
          <Radio.Group
            onChange={event => {
              onChange({
                date,
                name,
                datagramType: event.target.value,
              });
              setValue(event.target.value);
            }}
            value={value}
          >
            <Radio value={"CW"}>等幅报</Radio>
            <Radio value={"DATA"}>数据报</Radio>
            <Radio value={"TEL"}>话务报</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default McSaveTdModal;

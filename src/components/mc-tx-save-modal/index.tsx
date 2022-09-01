import "./index.less";
import React, { FC, useState } from "react";
import moment from "moment";
import McButton from "components/mc-button";
import { Form, Input, DatePicker } from "antd";
import { SendOutlined, CloseCircleFilled, SaveOutlined } from "@ant-design/icons";
import McModalNice from "components/mc-modal-nice";
interface IForm {
  name: string;
  date: string;
  finish?: boolean;
}

interface IProps {
  name: string;
  date: string;
  title: string;
  visible: boolean;
  loading?: boolean;
  exit?: boolean;
  send?: boolean; //是否为发报
  finish?: boolean; //是否已发送完成
  goTx?: boolean; //是否显示前往发报按钮
  onCancel?: VoidFunction;
  onSubmit?: (goTx: boolean) => void;
  onChange: (data: IForm) => void;
  onExit: () => void;
}

const McSaveModal: FC<IProps> = ({
  name,
  date,
  title,
  visible,
  exit = true,
  onSubmit,
  onCancel,
  onChange,
  onExit,
  children,
  loading = false,
  send = false,
  finish = false,
  goTx = false,
}) => {
  const [clickFlag, setClickFlag] = useState(false);
  const footer = (
    <>
      <McButton key="back" type="primary" danger onClick={onCancel}>
        取消
      </McButton>
      {exit && (
        <McButton key="exit" icon="exit" type="primary" danger onClick={onExit}>
          不保存
        </McButton>
      )}
      {goTx && (
        <McButton key="goTx" type="primary" warning onClick={() => onSubmit(true)}>
          <SendOutlined style={{ marginBottom: -2 }} /> 保存并发送
        </McButton>
      )}
      <McButton
        disabled={clickFlag}
        key="submit"
        type="primary"
        onClick={() => {
          setClickFlag(true);
          onSubmit(false);
        }}
      >
        <SaveOutlined /> 保存
      </McButton>
    </>
  );
  return (
    <McModalNice
      // width={672}
      okText="保存报文"
      title={title}
      visible={visible}
      footer={footer}
      centered
      onCancel={onCancel}
      className="mc-tx-save-modal"
      confirmLoading={loading}
      onOk={() => onSubmit(goTx)}
    >
      <div className="mc-tx-save-modal__hint">{children}</div>
      <Form layout="vertical">
        <Form.Item label="报文名称 (必填)">
          <Input
            value={name}
            maxLength={20}
            placeholder="请输入报文名称"
            onChange={event => {
              onChange({
                date,
                name: event.currentTarget.value,
              });
            }}
          />
        </Form.Item>
        {/* {
          onType &&
          <Form.Item label="">
            <label className="tb_label">通波:</label>
            <Switch onChange={(checked: boolean) => {
              // setTbType(checked);
              onType(checked);
            }} />
          </Form.Item>
        } */}
        {send && (
          <Form.Item required label="日期时间 (必填)">
            <DatePicker
              showTime
              placeholder="请选择"
              suffixIcon={<CloseCircleFilled />}
              dropdownClassName="mc-datepicker"
              value={date ? moment(date) : moment()}
              onChange={(_, s) => {
                onChange({
                  name,
                  date: s,
                });
              }}
            />
          </Form.Item>
        )}

        {/*{send && (*/}
        {/*  <Form.Item>*/}
        {/*    <Checkbox*/}
        {/*      checked={finish}*/}
        {/*      onChange={event => {*/}
        {/*        onChange({*/}
        {/*          name,*/}
        {/*          date: date,*/}
        {/*          finish: event.target.checked,*/}
        {/*        });*/}
        {/*      }}*/}
        {/*      value=""*/}
        {/*    >*/}
        {/*      已完成发报*/}
        {/*    </Checkbox>*/}
        {/*  </Form.Item>*/}
        {/*)}*/}
      </Form>
    </McModalNice>
  );
};

export default McSaveModal;

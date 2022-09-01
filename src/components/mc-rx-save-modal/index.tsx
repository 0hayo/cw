import "./index.less";
import moment from "moment";
import React, { FC, useState } from "react";
import McButton from "components/mc-button";
import { Form, Input, Checkbox, DatePicker } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import McModalNice from "../mc-modal-nice/index";

interface IForm {
  name: string;
  date: string;
  state: "none" | "check";
}

interface IProps {
  name: string;
  date: string;
  state: "none" | "check";
  title: string;
  print?: boolean;
  visible: boolean;
  loading?: boolean;
  onPrint?: VoidFunction;
  onCancel?: VoidFunction;
  onSubmit?: VoidFunction;
  onForward?: VoidFunction;
  onChange: (data: IForm) => void;
  onExit: () => void;
  showFlag?: boolean;
}

const McSaveModal: FC<IProps> = ({
  name,
  date,
  state,
  title,
  print,
  visible,
  onPrint,
  onSubmit,
  onForward,
  onCancel,
  onChange,
  onExit,
  children,
  loading = false,
  showFlag = true,
}) => {
  // useState()
  const [clickFlag, setClickFlag] = useState(false);
  const footer = (
    <>
      {
        <McButton type="primary" danger key="back" onClick={onCancel}>
          取消
        </McButton>
      }
      {/*<McButton key="exit" icon="exit" type="primary" danger onClick={onExit}>*/}
      {/*  不保存*/}
      {/*</McButton>*/}
      {print && showFlag && (
        <McButton key="print" icon="printer" type="primary" onClick={onPrint}>
          保存并打印
        </McButton>
      )}
      <McButton warning key="forward" icon="send" type="primary" onClick={onForward}>
        保存并转发
      </McButton>
      {
        <McButton
          disabled={clickFlag}
          key="submit"
          icon="save"
          type="primary"
          onClick={() => {
            setClickFlag(true);
            onSubmit();
          }}
        >
          保存
        </McButton>
      }
    </>
  );

  return (
    <McModalNice
      // width={672}
      centered
      okText="保存"
      title={title}
      footer={footer}
      visible={visible}
      onCancel={onCancel}
      className="mc-rx-save-modal"
      confirmLoading={loading}
    >
      <div className="mc-rx-save-modal__hint">{children}</div>
      <Form layout="vertical">
        <Form.Item required label="报文名称 (必填)">
          <Input
            value={name}
            maxLength={20}
            placeholder="请输入"
            onChange={event => {
              onChange({
                state,
                date,
                name: event.currentTarget.value,
              });
            }}
          />
        </Form.Item>
        <Form.Item required label="日期时间 (必填)">
          <DatePicker
            showTime
            placeholder="请选择"
            suffixIcon={<CloseCircleFilled />}
            dropdownClassName="mc-datepicker"
            value={date ? moment(date) : null}
            onChange={(_, s) => {
              onChange({
                name,
                date: s,
                state,
              });
            }}
          />
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={state === "check"}
            onChange={event => {
              onChange({
                date,
                name,
                state: event.target.checked ? "check" : "none",
              });
            }}
          >
            已校报
          </Checkbox>
        </Form.Item>
      </Form>
    </McModalNice>
  );
};

export default McSaveModal;

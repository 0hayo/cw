import { Col, Input, Modal, Row, Select } from "antd";
import React, { FC, useState } from "react";
import { EditOutlined, CloseCircleOutlined, SaveFilled } from "@ant-design/icons";
import message from "misc/message";
import { MstTheme } from "less/theme";
import Checkbox from "antd/lib/checkbox/Checkbox";
import { useEffect } from "react";

interface IProps {
  data: ITelegramCode;
  allData: ITelegramCode[];
  isNew: boolean;
  onDrop: (id: number) => void;
  onSave: (data: ITelegramCode) => void;
  onSelect?: (data: ITelegramCode) => void;
  readonly?: boolean;
  selected?: boolean;
}

const TelegramCodeItem: FC<IProps> = props => {
  const [data, setData] = useState(props.data);
  const [edit, setEdit] = useState(props.isNew);

  const preCheck = (): boolean => {
    message.destroy();
    if (!data.primaryFlag) {
      message.failure("请选择台站主属类型。");
      return false;
    }

    // const existsPrimary = props.allData.find(x => x.primaryFlag === "Z" && x.id !== data.id);
    // if (data.primaryFlag === "Z" && existsPrimary) {
    //   message.failure("只能设置一个主台！当前已存在主台：" + existsPrimary.name);
    //   return false;
    // }

    if (data.primaryFlag === "S" && !data.belongSeq) {
      message.failure("台号必须设置。");
      return false;
    }
    const existsSeq = props.allData.find(x => x.belongSeq === data.belongSeq && x.id !== data.id);
    if (data.primaryFlag === "S" && existsSeq) {
      message.failure(`台号"${data.belongSeq}"重复，已有:"${existsSeq.name}" 使用此序号`);
      return false;
    }

    const existsNative = props.allData.find(x => x.nativeFlag === "0" && x.id !== data.id);
    if (data.nativeFlag === "0" && existsNative) {
      message.failure(`只能设置一个本台，已有属台:"${existsNative.name}" 被设置为本台。`);
      return false;
    }

    if (!data.name || data.name.trim() === "") {
      message.failure("请输入台站备注。");
      return false;
    }
    if (!data.telegramCode || data.telegramCode.trim() === "") {
      message.failure("请输入电报代号。");
      return false;
    }
    if (!data.otherCode || data.otherCode.trim() === "") {
      message.failure("请输入被呼代号。");
      return false;
    }
    if (!data.ownCode || data.ownCode.trim() === "") {
      message.failure("请输入自用代号。");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const keyEventHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEdit(false);
      }
    };
    document.body.addEventListener("keydown", keyEventHandler);
    return () => document.body.removeEventListener("keydown", keyEventHandler);
  }, []);

  return (
    <Row
      // className={`content-row ${props.onSelect ? "with-hover" : ""}`}
      className={`content-row with-hover ${props.selected ? "active" : ""}`}
      onClick={() => props.onSelect && props.onSelect(data)}
      style={props.onSelect ? { cursor: "pointer" } : {}}
    >
      {edit ? (
        <>
          <Col className="content-col primary-setting-col" span="8">
            <Select
              className="select-primary-flag"
              // defaultValue="Z"
              value={data.primaryFlag}
              onChange={value => {
                console.log("change primary flag:", value);
                if (value === "Z") {
                  setData({ ...data, primaryFlag: value, belongSeq: 0 });
                } else {
                  setData({ ...data, primaryFlag: value });
                }
              }}
            >
              <Select.Option value="Z">主台</Select.Option>
              <Select.Option value="S">属台</Select.Option>
            </Select>
            {data.primaryFlag === "S" && (
              <>
                <span className="belong-seq-title">台号:</span>
                <Input
                  className="belong-seq-input"
                  type="number"
                  value={data.belongSeq}
                  onChange={e => setData({ ...data, belongSeq: parseInt(e.currentTarget.value) })}
                />
              </>
            )}
            <Checkbox
              checked={data.nativeFlag === "0"}
              onChange={e => setData({ ...data, nativeFlag: e.target.checked ? "0" : "1" })}
            >
              {" "}
              本台
            </Checkbox>
          </Col>
          <Col className="content-col" span="4">
            <Input
              value={data.telegramCode}
              onChange={e =>
                setData({ ...data, telegramCode: e.currentTarget.value.toUpperCase() })
              }
            />
          </Col>
          <Col className="content-col" span="3">
            <Input
              value={data.otherCode}
              onChange={e => setData({ ...data, otherCode: e.currentTarget.value.toUpperCase() })}
            />
          </Col>
          <Col className="content-col" span="3">
            <Input
              value={data.ownCode}
              onChange={e => setData({ ...data, ownCode: e.currentTarget.value.toUpperCase() })}
            />
          </Col>
          <Col className="content-col" span={props.readonly ? 6 : 3}>
            <Input
              autoFocus={true}
              value={data.name}
              onChange={e => setData({ ...data, name: e.currentTarget.value })}
            />
          </Col>
        </>
      ) : (
        <>
          <Col className="content-col" span="8" style={{ justifyContent: "left", paddingLeft: 8 }}>
            {data.primaryFlag === "Z" ? "主" : "属"}{" "}
            {data.belongSeq && !isNaN(data.belongSeq) ? data.belongSeq : ""} 台
            {data.nativeFlag === "0" && " (本台)"}
          </Col>
          <Col className="content-col" span="4">
            {data.telegramCode}
          </Col>
          <Col className="content-col" span="3">
            {data.otherCode}
          </Col>
          <Col className="content-col" span="3">
            {data.ownCode}
          </Col>
          <Col
            className="content-col"
            span={props.readonly ? 6 : 3}
            style={{ justifyContent: "left", paddingLeft: 8 }}
          >
            {data.name}
          </Col>
        </>
      )}
      {!props.readonly && (
        <Col className="edit-btns-col" span="3">
          {edit ? (
            <div
              className="edit-btn"
              style={{ color: MstTheme.mc_green_color }}
              onClick={() => {
                if (preCheck()) {
                  props.onSave(data);
                  setEdit(false);
                }
              }}
            >
              <SaveFilled />
            </div>
          ) : (
            <div className="edit-btn" onClick={() => setEdit(true)}>
              <EditOutlined />
            </div>
          )}
          <div
            className="edit-btn"
            onClick={() => {
              Modal.confirm({
                centered: true,
                maskClosable: false,
                content: "确定要删除该台站信息?",
                onOk: () => props.onDrop(data.id),
              });
            }}
          >
            <CloseCircleOutlined />
          </div>
        </Col>
      )}
    </Row>
  );
};

export default TelegramCodeItem;

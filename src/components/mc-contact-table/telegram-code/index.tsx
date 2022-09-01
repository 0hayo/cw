import "./index.less";
import React, { FC, useEffect, useState } from "react";
import useTelegramCode from "./useTelegramCode";
import useForm from "./useForm";
import MstPanel from "components/mst-panel";
import { Col, Row } from "antd";
import TelegramCodeItem from "./item";
import { PlusCircleOutlined } from "@ant-design/icons";

interface IProps {
  contactId: number;
  readonly?: boolean;
  selectedTelegramCode?: string; //选中的电报代号
  onSelect?: (station: ITelegramCode) => void;
}

const NEW_RECORD_TMPL: ITelegramCode = {
  id: null,
  telegramCode: "",
  otherCode: "",
  ownCode: "",
  primaryFlag: "S",
  contactId: null,
};

const TelegramCodePanel: FC<IProps> = ({
  contactId,
  selectedTelegramCode = "",
  readonly = false,
  onSelect,
}) => {
  const [form, setForm, setProps] = useForm();
  const { remove, save } = useTelegramCode(contactId, form, setForm);
  const [telegramCode, setTelegramCode] = useState(selectedTelegramCode);
  // const listHeight = useAutoHeight("telegram-code-list-container", 80);

  useEffect(() => {
    //响应Esc键，退出编辑模式
    const keyEventHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProps("add")(false);
      }
    };
    document.body.addEventListener("keydown", keyEventHandler);
    return () => document.body.removeEventListener("keydown", keyEventHandler);
  }, [setProps]);

  return (
    <MstPanel header={false} className="home-telegram-code">
      <div className="contact-table-setting-subtitle">
        <div>{onSelect ? "联络台站" : "联络台站表"}</div>
        <div className="add-button">
          {!readonly && <PlusCircleOutlined onClick={() => setProps("add")(true)} />}
        </div>
      </div>
      <div className="content-list" id="telegram-code-list-container">
        <Row className="header-row">
          <Col className="header-col" span="8">
            主属
          </Col>
          <Col className="header-col" span="4">
            电报代号
          </Col>
          <Col className="header-col" span="3">
            被呼
          </Col>
          <Col className="header-col" span="3">
            自用
          </Col>
          <Col className="header-col" span={readonly ? 6 : 3}>
            备注
          </Col>
          {!readonly && <Col className="header-col" span="3"></Col>}
        </Row>
        <div className="telegram-code-list" style={readonly ? { maxHeight: 312 } : {}}>
          {form.telegramCodes?.map(it => (
            <TelegramCodeItem
              key={`mst-setting-telegram-code-${it.id}`}
              data={it}
              allData={form.telegramCodes}
              isNew={false}
              onDrop={id => remove(id)}
              onSave={data => save(data)}
              readonly={readonly}
              onSelect={station => {
                onSelect(station);
                setTelegramCode(station.telegramCode);
              }}
              selected={telegramCode === it.telegramCode}
            />
          ))}
          {form.add && (
            <TelegramCodeItem
              data={{ ...NEW_RECORD_TMPL, contactId: contactId }}
              allData={form.telegramCodes}
              isNew={true}
              onDrop={id => setProps("add")(false)}
              onSave={data => save(data)}
            />
          )}
        </div>
      </div>
    </MstPanel>
  );
};

export default TelegramCodePanel;

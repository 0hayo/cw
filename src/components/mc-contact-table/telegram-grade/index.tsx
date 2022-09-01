import "./index.less";
import React, { FC, useEffect, useState } from "react";
import useTelegramGrade from "./useTelegramGrade";
import MstPanel from "components/mst-panel";
import { Col, Input, Row } from "antd";
import { SaveFilled, EditOutlined } from "@ant-design/icons";
import message from "misc/message";

interface IProps {
  contactId: number;
  readonly?: boolean;
}

const TelegramGradePanel: FC<IProps> = ({ contactId, readonly = false }) => {
  const [telegramGradeList, setTelegramGradeList] = useState<ITelegramGrade[]>([]);
  const [edit, setEdit] = useState(false);

  const { save } = useTelegramGrade(setTelegramGradeList, setEdit, contactId);

  useEffect(() => {
    //响应Esc键，退出编辑模式
    const keyEventHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEdit(false);
      }
    };
    document.body.addEventListener("keydown", keyEventHandler);
    return () => document.body.removeEventListener("keydown", keyEventHandler);
  }, []);

  const getGrade = (text: string, type: number): ITelegramGrade => {
    const grade = telegramGradeList.find(x => x.text === text && x.type === type);
    return grade
      ? grade
      : {
          id: null,
          code: "",
          text: text,
          contactTableId: contactId,
          type: type,
        };
  };

  const changeGrade = (text: string, type: number, code: string) => {
    const regular = /^[0-9][0-9]$/;
    let _code = code;
    if (_code.length > 1 && !regular.test(_code)) {
      message.destroy();
      message.failure("电报等级必须为两位数字！");
      _code = _code.length > 2 ? _code.substring(0, 2) : "";
    }
    const target = getGrade(text, type);
    const temp = [...telegramGradeList.filter(x => x !== target)];
    target.code = _code;
    temp.push(target);
    setTelegramGradeList(temp);
  };

  return (
    <MstPanel header={false} className="home-telegram-grade">
      <div className="contact-table-setting-subtitle">
        <div className="telegram-grade-name">电报等级表</div>
        {!readonly &&
          (edit ? (
            <SaveFilled onClick={() => save(telegramGradeList)} />
          ) : (
            <EditOutlined onClick={() => setEdit(true)} />
          ))}
      </div>
      <div className="content-list">
        <Row className="header-row">
          <Col className="header-col" span="6">
            等级
          </Col>
          <Col className="header-col" span="6">
            特急
          </Col>
          <Col className="header-col" span="6">
            加急
          </Col>
          <Col className="header-col" span="6">
            急报
          </Col>
        </Row>
        {edit ? (
          <>
            <Row className="content-row">
              <Col className="content-col telegram-type" span="6">
                训练报
              </Col>
              <Col className="content-col" span="6">
                <Input
                  maxLength={2}
                  value={getGrade("特急", 2).code}
                  onChange={e => changeGrade("特急", 2, e.currentTarget.value)}
                />
              </Col>
              <Col className="content-col" span="6">
                <Input
                  maxLength={2}
                  value={getGrade("加急", 2).code}
                  onChange={e => changeGrade("加急", 2, e.currentTarget.value)}
                />
              </Col>
              <Col className="content-col" span="6">
                <Input
                  maxLength={2}
                  value={getGrade("急报", 2).code}
                  onChange={e => changeGrade("急报", 2, e.currentTarget.value)}
                />
              </Col>
            </Row>
            <Row className="content-row">
              <Col className="content-col telegram-type" span="6">
                工作报
              </Col>
              <Col className="content-col" span="6">
                <Input
                  maxLength={2}
                  autoFocus
                  value={getGrade("特急", 1).code}
                  onChange={e => changeGrade("特急", 1, e.currentTarget.value)}
                />
              </Col>
              <Col className="content-col" span="6">
                <Input
                  maxLength={2}
                  value={getGrade("加急", 1).code}
                  onChange={e => changeGrade("加急", 1, e.currentTarget.value)}
                />
              </Col>
              <Col className="content-col" span="6">
                <Input
                  maxLength={2}
                  value={getGrade("急报", 1).code}
                  onChange={e => changeGrade("急报", 1, e.currentTarget.value)}
                />
              </Col>
            </Row>
          </>
        ) : (
          <>
            <Row className="content-row">
              <Col className="content-col telegram-type" span="6">
                训练报
              </Col>
              <Col className="content-col" span="6">
                {getGrade("特急", 2).code}
              </Col>
              <Col className="content-col" span="6">
                {getGrade("加急", 2).code}
              </Col>
              <Col className="content-col" span="6">
                {getGrade("急报", 2).code}
              </Col>
            </Row>
            <Row className="content-row">
              <Col className="content-col telegram-type" span="6">
                工作报
              </Col>
              <Col className="content-col" span="6">
                {getGrade("特急", 1).code}
              </Col>
              <Col className="content-col" span="6">
                {getGrade("加急", 1).code}
              </Col>
              <Col className="content-col" span="6">
                {getGrade("急报", 1).code}
              </Col>
            </Row>
          </>
        )}
      </div>
    </MstPanel>
  );
};

export default TelegramGradePanel;

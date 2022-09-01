import "./index.less";
import React, { FC, useEffect, useState } from "react";
import useMaskCode from "./useMskCode";
import MstPanel from "components/mst-panel";
import { SaveFilled, EditOutlined } from "@ant-design/icons";
import { Col, Input, Row } from "antd";
import message from "misc/message";

interface ItemProps {
  contactId: number;
  readonly?: boolean;
  className?: string;
}

const MaskCodePanel: FC<ItemProps> = ({ contactId, readonly = false, className = "" }) => {
  const [codeList, setCodeList] = useState<IMaskCode[]>([]);
  const [codeTable, setCodeTable] = useState<IMaskCode[]>([]);
  const [edit, setEdit] = useState(false);

  const { save } = useMaskCode(setCodeList, setEdit, contactId);

  /** 构造用于显示的mask code 数组*/
  useEffect(() => {
    const table: IMaskCode[] = [];
    for (let i = 0; i < 10; i++) {
      const code = codeList.find(x => x.realCode === i + "");
      table.push(code || { id: null, realCode: i + "", pseudocode: "", contactId: contactId });
    }
    setCodeTable(table);
  }, [codeList, contactId, setCodeTable]);

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

  const changeCode = (realCode: string, pseudoCode: string) => {
    const numVal = parseInt(pseudoCode);
    if (numVal > 9 || numVal < 0) {
      message.destroy();
      message.warning("伪码输入错误", "伪码必须为0~9的整数");
      return false;
    }
    const code = codeTable.find(x => x.realCode === realCode);
    code.pseudocode = numVal + "";
    const table = [...codeTable];
    table[parseInt(realCode)] = code;
    setCodeTable(table);
  };

  return (
    <MstPanel header={false} className={`home-mask-code ${className}`}>
      <div className="contact-table-setting-subtitle">
        <div>真伪码转换表</div>
        {!readonly &&
          (edit ? (
            <SaveFilled onClick={() => save(codeTable)} />
          ) : (
            <EditOutlined onClick={() => setEdit(true)} />
          ))}
      </div>
      <div className="content-list">
        <Row className="header-row">
          <Col className="header-col" span="4">
            真码
          </Col>
          {codeTable.map(
            it =>
              it.realCode < "5" && (
                <Col className="header-col" span="4" key={`mst-mask-code-${it.realCode}`}>
                  {it.realCode}
                </Col>
              )
          )}
        </Row>
        <Row className="content-row">
          <Col className="content-col" span="4">
            伪码
          </Col>
          {codeTable.map(
            it =>
              it.realCode < "5" && (
                <Col className="content-col" span="4" key={`mst-mask-code-${it.realCode}-2`}>
                  {edit ? (
                    <Input
                      type="number"
                      max={9}
                      min={0}
                      maxLength={1}
                      autoFocus
                      value={parseInt(it.pseudocode)}
                      onChange={e => {
                        changeCode(it.realCode, e.currentTarget.value);
                      }}
                    />
                  ) : (
                    <>{it.pseudocode}</>
                  )}
                </Col>
              )
          )}
        </Row>
        <Row className="header-row">
          <Col className="header-col" span="4">
            真码
          </Col>
          {codeTable.map(
            it =>
              it.realCode >= "5" && (
                <Col className="header-col" span="4" key={`mst-mask-code-${it.realCode}`}>
                  {it.realCode}
                </Col>
              )
          )}
        </Row>
        <Row className="content-row">
          <Col className="content-col" span="4">
            伪码
          </Col>
          {codeTable.map(
            it =>
              it.realCode >= "5" && (
                <Col className="content-col" span="4" key={`mst-mask-code-${it.realCode}-2`}>
                  {edit ? (
                    <Input
                      type="number"
                      max={9}
                      min={0}
                      maxLength={1}
                      autoFocus
                      value={parseInt(it.pseudocode)}
                      onChange={e => {
                        changeCode(it.realCode, e.currentTarget.value);
                      }}
                    />
                  ) : (
                    <>{it.pseudocode}</>
                  )}
                </Col>
              )
          )}
        </Row>
      </div>
    </MstPanel>
  );
};

export default MaskCodePanel;

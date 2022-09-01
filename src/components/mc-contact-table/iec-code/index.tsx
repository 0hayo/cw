import "./index.less";
import React, { FC, useEffect, useState } from "react";
import MstPanel from "components/mst-panel";
import { Col, Input, Row } from "antd";
import { EditOutlined, SaveFilled } from "@ant-design/icons";
import useIecCode from "./useIecCode";

interface IProps {
  contactId: number;
  readonly?: boolean;
}

type IecCodeRow = IIecCode[];

/** 识别暗令表的行列数 */
interface IecTableMeta {
  rows: number;
  cols: number;
  span: number;
}

const TelegramIecPanel: FC<IProps> = ({ contactId, readonly = false }) => {
  //原始数据
  const [iecCodeList, setIecCodeList] = useState<IIecCode[]>([]);
  //按行列格式化后的数据
  const [iecCodeTable, setIecCodeTable] = useState<IecCodeRow[]>([]);
  //识别暗令表的行列数
  const [meta, setMeta] = useState<IecTableMeta>({ rows: 4, cols: 4, span: 6 });
  //编辑模式
  const [edit, setEdit] = useState(false);

  const genIecCodeObj = (row: number, column: number) => {
    return {
      id: null,
      row,
      column,
      code: "",
      contactId: contactId,
    };
  };

  //原始数据内容发生变化时重新计算行列，格式化数据
  useEffect(() => {
    const _meta: IecTableMeta = { rows: 4, cols: 4, span: 8 };
    if (iecCodeList && iecCodeList.length > 0) {
      //先获得行数、列数
      const sortedByRow = iecCodeList.sort((a, b) => (a.row < b.row ? 1 : -1));
      const maxRow = sortedByRow[0].row;
      const sortedByCol = iecCodeList.sort((a, b) => (a.column < b.column ? 1 : -1));
      const maxCol = sortedByCol[0].column;
      _meta.rows = maxRow;
      _meta.cols = maxCol;
      _meta.span = Math.floor(24 / maxCol);
    } else {
      _meta.span = 6;
    }
    setMeta(_meta);
  }, [iecCodeList, setMeta, setIecCodeTable]);

  //当表格的行列定义发生变化时，重新格式化数据
  useEffect(() => {
    const table = [];
    //按行/列格式化数据
    for (let i = 1; i <= meta.rows; i++) {
      const tableRow: IecCodeRow = [];
      for (let j = 1; j <= meta.cols; j++) {
        const iecCode = iecCodeList.find(x => x.row === i && x.column === j);
        tableRow.push(iecCode || genIecCodeObj(i, j));
      }
      table.push(tableRow);
    }
    setIecCodeTable(table);
    //eslint-disable-next-line
  }, [meta]);

  const { save } = useIecCode(setIecCodeList, setEdit, contactId);

  const changeIecCode = (row: number, col: number, value: string) => {
    const target = iecCodeTable[row - 1][col - 1];
    target.code = value.toUpperCase();
    const copy = [...iecCodeTable];
    copy[row - 1][col - 1] = target;
    setIecCodeTable(copy);
  };

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

  return (
    <MstPanel header={false} className="home-telegram-iec">
      <div className="contact-table-setting-subtitle">
        <div>识别暗令表</div>
        {!readonly && (
          <div className="iec-table-meta">
            {edit ? (
              <>
                <Input
                  type="number"
                  min={4}
                  max={10}
                  value={meta.rows}
                  onChange={e => setMeta({ ...meta, rows: parseInt(e.currentTarget.value) })}
                />
                {" × "}
                <Input
                  type="number"
                  min={4}
                  max={10}
                  value={meta.cols}
                  onChange={e => {
                    const _cols = parseInt(e.currentTarget.value);
                    const _span = Math.floor(24 / _cols);
                    setMeta({ ...meta, cols: _cols, span: _span });
                  }}
                />
                <SaveFilled onClick={() => save(iecCodeTable, meta.rows, meta.cols)} />
              </>
            ) : (
              <>
                {meta.rows} × {meta.cols}
                <EditOutlined onClick={() => setEdit(true)} />
              </>
            )}
          </div>
        )}
      </div>
      <div className="content-list">
        {edit &&
          iecCodeTable.map((row, rowIdx) => (
            <Row className="content-row iec-row" key={`mst-settings-iec-code-row-${rowIdx}`}>
              {row.map((iecCode, colIdx) => (
                <Col
                  span={meta.span}
                  className="iec-col content-col"
                  key={`mst-setting-iec-code-item-${rowIdx}-${colIdx}`}
                >
                  <Input
                    autoFocus={rowIdx === 0 && colIdx === 0}
                    value={iecCode.code}
                    onChange={e =>
                      changeIecCode(iecCode.row, iecCode.column, e.currentTarget.value)
                    }
                  />
                </Col>
              ))}
            </Row>
          ))}
        {!edit &&
          iecCodeTable.map((row, rowIdx) => (
            <Row className="content-row iec-row" key={`mst-settings-iec-code-row-${rowIdx}`}>
              {row.map((iecCode, colIdx) => (
                <Col
                  span={meta.span}
                  className="content-col iec-col"
                  key={`mst-setting-iec-code-item-${rowIdx}-${colIdx}`}
                >
                  <span>{iecCode.code}</span>
                </Col>
              ))}
            </Row>
          ))}
      </div>
    </MstPanel>
  );
};

export default TelegramIecPanel;

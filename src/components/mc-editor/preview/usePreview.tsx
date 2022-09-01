import guid from "misc/guid";
import { correctBody, size, trim } from "misc/telegram";
import message from "misc/message";
import McFormatService from "services/format-service";
import React, { useState, useEffect, ReactElement } from "react";

const printFontFamily = "'AR PL Ukai CN', FangSong, FangSong_GB2312";
const EMPTY_BODY: McTelegramHash = { 0: { value: "" } };

//报文打印格式预览组件
const usePreview = (
  type: TelegramBizType,
  name: string,
  head: McTelegramHash,
  body: McTelegramHash,
  scale?: number
): ReactElement => {
  const [content, setContent] = useState<ReactElement>(<div />);

  useEffect(() => {
    (async () => {
      try {
        //获取格式模板信息：
        // alert(form.type);
        const fmttmpl = await McFormatService.load("训练报", type);
        if (!fmttmpl) return;
        // const fmttmpl = await McFormatService.load(name, "CCK");
        const format = JSON.parse(JSON.stringify(fmttmpl.content));
        //表格线的粗细和颜色
        const lineColor = format.line && format.line.color ? format.line.color : "#000000";
        const lineWidth = format.line && format.line.width ? parseInt(format.line.width) : 1;
        //表格每行高度
        const cellHeight = format.cell_height ? parseInt(format.cell_height) : 27;
        const fontSize = format.font_size ? parseInt(format.font_size) : 22;
        const crudeFontSize = 14;
        //报头格式定义
        const headFmt = format.head;
        //(每页)报文行数
        const rowCnt = format.body && format.body.page_row ? parseInt(format.body.page_row) : 30;
        //每行单元格数：
        const rowCellCnt =
          format.body && format.body.row_cells ? parseInt(format.body.row_cells) : 10;
        //报头和正文
        const headData = head;
        const bodyData = trim(correctBody(body && body[0] ? body : EMPTY_BODY));

        //报文正文长度
        const bodyLen = size(bodyData);

        //页数
        const pageCnt = rowCnt === 1 ? 1 : Math.ceil(bodyLen / (rowCnt * 10));

        //表格样式
        const tableStyle = {
          width: "100%",
        };
        //单元格样式
        const contentStyle = {
          fontSize: fontSize,
          marginBottom: -6,
          fontFamily: printFontFamily,
        };
        const contentTableStyle = {
          border: lineWidth + "px solid " + lineColor,
          height: cellHeight,
          fontSize: fontSize,
          fontFamily: printFontFamily,
        };
        const _5thColStyle = {
          ...contentTableStyle,
          borderRight: lineWidth * 2 + "px solid " + lineColor,
        };
        const _5thRowStyle = {
          ...contentTableStyle,
          borderBottom: lineWidth * 2 + "px solid " + lineColor,
        };
        const labelStyle = {
          ...contentTableStyle,
          color: lineColor,
          fontWeight: 600,
          paddingLeft: 0,
        };
        const tailStyle = {
          border: 0,
          color: lineColor,
          fontWeight: 600,
          paddingLeft: 5,
          fontFamily: printFontFamily,
          display: "flex",
          alignItems: "left",
        };

        //报头部分
        const headContent = (
          <thead>
            {headFmt.map((headline: any) => (
              <tr key={guid()}>
                {headline.map((it: any) => (
                  <td
                    align={it.type === "label" ? "center" : "center"}
                    key={guid()}
                    style={
                      it.type === "label"
                        ? it.label === "附注"
                          ? {
                              color: lineColor,
                              fontWeight: 600,
                              paddingLeft: 0,
                              ...contentTableStyle,
                              height: 60,
                            }
                          : labelStyle
                        : { paddingLeft: 8, ...contentTableStyle }
                    }
                    rowSpan={it.rowspan ? it.rowspan : 1}
                    colSpan={it.colspan ? it.colspan : 1}
                  >
                    {(() => {
                      if (it.type === "label") {
                        return it.label;
                      }
                      const group = headData[it.field];
                      if (group && it.index >= 0) {
                        const content =
                          group.value === group.crude ? (
                            <div>
                              <div style={contentStyle}>{group.value}</div>
                            </div>
                          ) : (
                            <div>
                              <div
                                className={"mc-crude-content"}
                                style={{
                                  position: "absolute",
                                  fontSize: crudeFontSize,
                                  marginTop: -7,
                                  marginLeft: 0,
                                  color: "#FF0000",
                                }}
                              >
                                {group.crude}
                              </div>
                              <div style={contentStyle}>{group.value}</div>
                            </div>
                          );
                        return content;
                      }
                    })()}
                  </td>
                ))}
                <td></td>
              </tr>
            ))}
          </thead>
        );

        //报文正文部分数据
        const bodyContents = [];
        for (var p = 0; p < pageCnt; p++) {
          //页
          const bodyRows = [];
          for (var i = 0; i < rowCnt; i++) {
            //行
            const bodyRow = [];
            for (var j = 0; j < rowCellCnt; j++) {
              //单元格
              const idx = p * rowCnt * rowCellCnt + i * 10 + j;
              const group = bodyData[idx];
              const value = group ? group : { value: "", crude: "" };
              bodyRow.push(value);
            } //for i 单元格
            //每行的尾标
            let tailNum = i + 1;
            if (rowCnt > 10) {
              if (tailNum > 10 && tailNum % 10 !== 0) {
                tailNum = tailNum % 10;
              }
            } else {
              tailNum = tailNum * 10;
            }
            bodyRow.push({ value: tailNum, crude: tailNum });
            bodyRows.push(bodyRow);
          } //for j 行
          bodyContents.push(bodyRows);
        } //for p 页

        //构建每页报文内容
        const pages = [];
        for (let pg = 0; pg < pageCnt; pg++) {
          let counter = 0;
          pages.push(
            <div
              key={guid()}
              style={{
                width: "210mm",
                // height: "290mm",
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0,
                marginBottom: "6mm",
              }}
            >
              {/* <hr className={"no-print"} /> */}
              <div
                style={{
                  fontSize: "32px",
                  textAlign: "center",
                  letterSpacing: "1em",
                  color: lineColor,
                  paddingBottom: 16,
                }}
              >
                {type === "EX" && "信号纸"}
                {type !== "EX" && "电报纸"}
              </div>
              <table cellSpacing={0} cellPadding={0} style={tableStyle}>
                {headContent}
                <tbody>
                  {rowCnt > 1 && (
                    <tr>
                      <td align="center" style={{ ...labelStyle, width: "10%" }}>
                        1
                      </td>
                      <td align="center" style={{ ...labelStyle, width: "10%" }}>
                        2
                      </td>
                      <td align="center" style={{ ...labelStyle, width: "10%" }}>
                        3
                      </td>
                      <td align="center" style={{ ...labelStyle, width: "10%" }}>
                        4
                      </td>
                      <td align="center" style={{ ...labelStyle, ..._5thColStyle, width: "10%" }}>
                        5
                      </td>
                      <td align="center" style={{ ...labelStyle, width: "10%" }}>
                        6
                      </td>
                      <td align="center" style={{ ...labelStyle, width: "10%" }}>
                        7
                      </td>
                      <td align="center" style={{ ...labelStyle, width: "10%" }}>
                        8
                      </td>
                      <td align="center" style={{ ...labelStyle, width: "10%" }}>
                        9
                      </td>
                      <td align="center" style={{ ...labelStyle, width: "10%" }}>
                        10
                      </td>
                      <td style={{ border: 0 }}> </td>
                    </tr>
                  )}
                  {type !== "EX" &&
                    bodyContents[pg].map(it => (
                      <tr key={guid()}>
                        {it.map((group, idx) => {
                          let style = idx === 10 ? tailStyle : contentTableStyle;
                          if ((idx + 1) % 10 === 5) {
                            style = { ...style, ..._5thColStyle };
                          }
                          if (
                            rowCnt <= 10 &&
                            counter % 100 > 39 &&
                            counter % 100 <= 49 &&
                            idx !== 10
                          ) {
                            style = { ...style, ..._5thRowStyle };
                          } else if (
                            ((counter % 100 > 39 && counter % 100 <= 49) ||
                              (counter % 100 > 89 && counter % 100 <= 99)) &&
                            idx !== 10
                          ) {
                            style = { ...style, ..._5thRowStyle };
                          }
                          if (idx !== 10) {
                            counter = counter + 1;
                          }
                          return (
                            <td
                              className="print-preview-td"
                              key={guid()}
                              align={"center"}
                              style={style}
                            >
                              {group.value === group.crude ? (
                                <div>
                                  <div style={contentStyle}>{group.value}</div>
                                </div>
                              ) : (
                                <div>
                                  <div
                                    className={"mc-crude-content"}
                                    style={{
                                      position: "absolute",
                                      fontSize: crudeFontSize,
                                      marginTop: -7,
                                      marginLeft: 2,
                                      color: "#FF0000",
                                    }}
                                  >
                                    {group.crude}
                                  </div>
                                  <div style={contentStyle}>{group.value}</div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  {type === "EX" && ( //EX报文打印:
                    <tr key={guid()}>
                      <td
                        style={{
                          ...contentTableStyle,
                          width: 100,
                          height: 300,
                          verticalAlign: "center",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: printFontFamily,
                            textAlign: "center",
                            color: lineColor,
                          }}
                        >
                          内容
                        </div>
                      </td>
                      <td
                        colSpan={9}
                        style={{
                          ...contentTableStyle,
                          height: 300,
                          fontSize: "40px",
                          verticalAlign: "center",
                          textAlign: "center",
                        }}
                      >
                        {bodyContents[0][0][0].value === bodyContents[0][0][0].crude ? (
                          <div>
                            <div style={{ ...contentStyle, fontSize: "40px" }}>
                              {bodyContents[0][0][0].value}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div
                              className={"mc-crude-content"}
                              style={{
                                position: "absolute",
                                fontSize: crudeFontSize,
                                marginTop: -132,
                                marginLeft: 16,
                                color: "#FF0000",
                              }}
                            >
                              {bodyContents[0][0][0].crude}
                            </div>
                            <div
                              style={{
                                ...contentStyle,
                                fontSize: 24,
                                marginLeft: 10,
                                marginTop: 5,
                                textAlign: "center",
                              }}
                            >
                              {bodyContents[0][0][0].value}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div
                style={{
                  pageBreakAfter: "always",
                  textAlign: "center",
                  paddingTop: 16,
                  marginRight: 64,
                  paddingBottom: 16,
                }}
              >
                第 {pg + 1}页 - 共{pageCnt} 页
              </div>
            </div>
          );
        }

        setContent(
          <div
            id="print-area"
            style={{
              transform: `scale(${scale ? scale : 1.8})`,
              transformOrigin: "top left",
              height: "fit-content",
            }}
          >
            {pages.map(it => it)}
          </div>
        );
      } catch (e) {
        console.error(e);
        message.failure("报文模板格式错误(rx)" + (e.message ? e.message : e));
      }
    })();
  }, [name, type, head, body, scale]);

  return content;
};

export default usePreview;

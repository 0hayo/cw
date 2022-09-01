import _ from "lodash";
import McEditorCell from "./cell";
import McEditorMenu from "./menu";
import { max } from "misc/telegram";
import McEditorContext from "./context";
import McIcon from "components/mc-icon";
import usePrefix from "./hooks/usePrefix";
import useSuffix from "./hooks/useSuffix";
import { MceFlag, MceMenu } from "mce/typing";
import React, { FC, useContext, useEffect, useState } from "react";
import {
  PicLeftOutlined,
  MergeCellsOutlined,
  SplitCellsOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  SwapOutlined,
} from "@ant-design/icons";

interface IProps {
  hash: McTelegramHash;
  flag: MceFlag;
  menu: MceMenu;
  offset: number;
  highlight: number;
  direction: "rx" | "tx";
  image?: boolean;
}

const McEditorBody: FC<IProps> = ({ menu, offset, ...rest }) => {
  const idx = max(rest.hash);
  const { bus, uuid, range } = useContext(McEditorContext);
  const prefix = usePrefix(uuid, range, "body");
  const suffix = useSuffix(uuid, range, "body");
  // const showMenu = range.dx === rest.highlight;
  const [showMenu, setShowMenu] = useState(true);

  useEffect(() => {
    if ("rx" === rest.direction) return;
    if (range.dx === range.dy) {
      const targetCellValue = rest.hash[range.dx]?.value;
      setShowMenu(targetCellValue ? true : false);
    } else {
      for (let i = range.dx; i <= range.dy; i++) {
        const value = rest.hash[range.dy]?.value;
        if (!value) {
          setShowMenu(false);
          break;
        }
      }
    }
  }, [range, rest.direction, rest.hash]);

  return (
    <div className="mc-editor-body">
      <div className="mc-editor__gutter">
        <div className="mc-editor__col mc-editor__gutter--x" style={{ position: "initial" }}>
          1
        </div>
        <div className="mc-editor__col mc-editor__gutter--x">2</div>
        <div className="mc-editor__col mc-editor__gutter--x">3</div>
        <div className="mc-editor__col mc-editor__gutter--x">4</div>
        <div className="mc-editor__col mc-editor__gutter--x">5</div>
        <div className="mc-editor__col mc-editor__gutter--x">6</div>
        <div className="mc-editor__col mc-editor__gutter--x">7</div>
        <div className="mc-editor__col mc-editor__gutter--x">8</div>
        <div className="mc-editor__col mc-editor__gutter--x">9</div>
        <div className="mc-editor__col mc-editor__gutter--x">10</div>
        <div className="mc-editor__col mc-editor__gutter--y"></div>
      </div>
      {_.range(10).map(row => (
        <div key={row} className="mc-editor__row">
          {_.range(10).map(col => (
            <div key={col} className="mc-editor__col">
              <McEditorCell
                max={idx}
                role="body"
                index={row * 10 + col + offset}
                field={(row * 10 + col + offset).toString()}
                maxLength={4}
                autoFocus={row === 0 && col === 0}
                highlighting={row * 10 + col + offset === rest.highlight}
                {...rest}
              />
            </div>
          ))}
          <div className="mc-editor__col mc-editor__gutter--y">{row + 1}</div>
        </div>
      ))}

      {/*{(menu & MceMenu.Prefix) === MceMenu.Prefix && showMenu && (*/}
      {(menu & MceMenu.Prefix) === MceMenu.Prefix && (
        <>
          {"tx" === rest.direction && showMenu && (
            <>
              <McEditorMenu
                x={prefix.x}
                y={prefix.y}
                w={prefix.w}
                h={prefix.h}
                onClick={() => bus.emit(`mc-${uuid}:body:mark`, range.dx, range.dy)}
              >
                <McIcon>send</McIcon>
                <div>从此</div>
                <div>开始发送</div>
              </McEditorMenu>
              <McEditorMenu
                x={prefix.x}
                y={prefix.y + prefix.h}
                w={prefix.w}
                h={prefix.h}
                onClick={() => bus.emit(`mc-${uuid}:body:send`, range.dx, range.dy)}
              >
                <SwapOutlined />
                <div>重发</div>
                <div>此组报文</div>
              </McEditorMenu>
            </>
          )}
          {"rx" === rest.direction && showMenu && (
            <McEditorMenu
              x={prefix.x}
              y={prefix.y}
              w={prefix.w}
              h={prefix.h}
              onClick={() => bus.emit(`mc-${uuid}:body:send`, range.dx, range.dy)}
            >
              <SwapOutlined />
              <div>请求重发</div>
              <div>此组报文</div>
            </McEditorMenu>
          )}
        </>
      )}

      {(menu & MceMenu.Suffix) === MceMenu.Suffix && showMenu && (
        <>
          <McEditorMenu
            x={suffix.x}
            y={suffix.y}
            w={suffix.w}
            h={suffix.h}
            onClick={() => bus.emit(`mc-${uuid}:body:send`, range.dx, range.dy)}
          >
            <SwapOutlined />
            <div>{"tx" === rest.direction ? "重发" : "请求重发"}所选报文</div>
          </McEditorMenu>
        </>
      )}
      {/* 输报、OCR识别编辑菜单 */}
      {(menu & MceMenu.Edit) === MceMenu.Edit && showMenu && (
        <>
          <McEditorMenu
            x={prefix.x - 24}
            y={prefix.y}
            w={prefix.w + 24}
            h={prefix.h / 2 - 1}
            style={{ borderRadius: "12px 0 0 0" }}
            onClick={() => bus.emit(`mc-${uuid}:body:deleteCell`)}
          >
            <div>
              <McIcon size="12" color="red">
                close
              </McIcon>{" "}
              删除本格
            </div>
          </McEditorMenu>
          <McEditorMenu
            x={prefix.x - 24}
            y={prefix.y + prefix.h / 2 + 1}
            w={prefix.w + 24}
            h={prefix.h / 2 - 1}
            style={{ borderRadius: "0 0 0 12px" }}
            onClick={() => bus.emit(`mc-${uuid}:body:deleteRow`)}
          >
            <div>
              <McIcon size="12" color="red">
                delete
              </McIcon>{" "}
              删除本行
            </div>
          </McEditorMenu>
          <McEditorMenu
            x={prefix.x + 48 + (prefix.cw - 100) / 2}
            y={prefix.y - 40}
            w={100}
            h={prefix.h / 2 - 1}
            style={{ borderRadius: "12px" }}
            onClick={() => bus.emit(`mc-${uuid}:body:deleteFront`)}
          >
            <div>
              <DoubleLeftOutlined
                style={{
                  fontSize: 12,
                  color: "red",
                  verticalAlign: "middle",
                  marginRight: 5,
                }}
              />
              向前删除所有
            </div>
          </McEditorMenu>
          <McEditorMenu
            x={prefix.x + 48 + (prefix.cw - 100) / 2}
            y={prefix.y + prefix.h / 2 + 1 + 40}
            w={100}
            h={prefix.h / 2 - 1}
            style={{ borderRadius: "12px" }}
            onClick={() => bus.emit(`mc-${uuid}:body:deleteBehind`)}
          >
            <div>
              向后删除所有
              <DoubleRightOutlined
                style={{
                  fontSize: 12,
                  color: "red",
                  verticalAlign: "middle",
                  marginRight: 5,
                }}
              />
            </div>
          </McEditorMenu>
          <McEditorMenu
            x={prefix.x + prefix.cw + prefix.w}
            y={prefix.y}
            w={prefix.w + 24}
            h={prefix.h / 2 - 1}
            style={{ borderRadius: "0 12px 0 0" }}
            onClick={() => bus.emit(`mc-${uuid}:body:insertCell`)}
          >
            <div>
              后插一格{" "}
              <McIcon size="12" color="blue">
                file-add
              </McIcon>
            </div>
          </McEditorMenu>
          <McEditorMenu
            x={prefix.x + prefix.cw + prefix.w}
            y={prefix.y + prefix.h / 2 + 1}
            w={prefix.w + 24}
            h={prefix.h / 2 - 1}
            style={{ borderRadius: "0 0 12px 0" }}
            onClick={() => bus.emit(`mc-${uuid}:body:insertRow`)}
          >
            <div>
              下插一行{" "}
              <McIcon size="12" color="blue">
                grid
              </McIcon>
            </div>
          </McEditorMenu>
          <McEditorMenu
            x={suffix.x}
            y={suffix.y}
            w={suffix.w + 24}
            h={suffix.h / 2 - 1}
            style={{ borderRadius: "0 12px 0 0" }}
            onClick={() => bus.emit(`mc-${uuid}:body:insertCell`)}
          >
            <div>
              后插一格{" "}
              <McIcon size="12" color="blue">
                file-add
              </McIcon>
            </div>
          </McEditorMenu>
          <McEditorMenu
            x={suffix.x}
            y={suffix.y + suffix.h / 2 + 1}
            w={suffix.w + 24}
            h={suffix.h / 2 - 1}
            style={{ borderRadius: "0 0 12px 0" }}
            onClick={() => bus.emit(`mc-${uuid}:body:insertRow`)}
          >
            <div>
              下插一行{" "}
              <McIcon size="12" color="blue">
                grid
              </McIcon>
            </div>
          </McEditorMenu>
        </>
      )}
      {/* 整报菜单 Prefix*/}
      {(menu & MceMenu.RegularPre) === MceMenu.RegularPre && showMenu && (
        <>
          <McEditorMenu
            x={prefix.x - 8}
            y={prefix.y}
            w={prefix.w + 8}
            h={prefix.h / 2 - 1}
            style={{
              borderRadius: "12px 0 0 0",
              fontSize: 12,
              color: "#0091ff",
            }}
            onClick={() => bus.emit(`mc-${uuid}:body:regularInsert`, range.dx)}
          >
            <div>
              <PicLeftOutlined style={{ fontSize: 14, fontWeight: 600 }} /> 插入
            </div>
          </McEditorMenu>
          <McEditorMenu
            x={prefix.x - 8}
            y={prefix.y + prefix.h / 2 + 1}
            w={prefix.w + 8}
            h={prefix.h / 2 - 1}
            style={{
              borderRadius: "0 0 0 12px",
              fontSize: 12,
              color: "#0091ff",
            }}
            onClick={() => {
              const selectionIdx = prefix.input ? prefix.input.selectionEnd : 0;
              bus.emit(`mc-${uuid}:body:regularSplit`, range.dx, selectionIdx);
            }}
          >
            <div>
              <SplitCellsOutlined style={{ fontSize: 14, fontWeight: 600 }} /> 拆分
            </div>
          </McEditorMenu>
          {/* <McEditorMenu
           x={prefix.x + prefix.cw + prefix.w}
           y={prefix.y}
           w={prefix.w + 8}
           h={prefix.h / 2 - 1}
           style={{
             borderRadius: "0 12px 0 0",
             fontSize: 12,
             color: "#0091ff",
           }}
           onClick={() => bus.emit(`mc-${uuid}:body:regularPlay`, range.dx)}
          >
           <div>
             重听 <McIcon size="14">mic</McIcon>
           </div>
          </McEditorMenu> */}
          <McEditorMenu
            x={prefix.x + prefix.cw + prefix.w}
            y={prefix.y}
            w={prefix.w + 8}
            h={prefix.h}
            style={{
              borderRadius: "0 12px 12px 0",
              fontSize: 12,
              color: "#0091ff",
            }}
            onClick={() => bus.emit(`mc-${uuid}:body:regularDelete`, range.dx, range.dy)}
          >
            <div>
              删除{" "}
              <McIcon size="14" color="#ff4d4f">
                delete
              </McIcon>
            </div>
          </McEditorMenu>
        </>
      )}
      {/* 整报菜单 Suffix */}
      {(menu & MceMenu.RegularSuf) === MceMenu.RegularSuf && showMenu && (
        <>
          <McEditorMenu
            x={suffix.x}
            y={suffix.y}
            w={suffix.w + 8}
            h={suffix.h / 2 - 1}
            style={{
              borderRadius: "0 12px 0 0",
              fontSize: 12,
              color: "blue",
            }}
            onClick={() => bus.emit(`mc-${uuid}:body:regularMerge`, range.dx, range.dy)}
          >
            <div>
              合并 <MergeCellsOutlined style={{ color: "blue", fontSize: 12, fontWeight: 600 }} />
            </div>
          </McEditorMenu>
          <McEditorMenu
            x={suffix.x}
            y={suffix.y + suffix.h / 2 + 1}
            w={suffix.w + 8}
            h={suffix.h / 2 - 1}
            style={{ borderRadius: "0 0 12px 0", fontSize: 12, color: "blue" }}
            onClick={() => bus.emit(`mc-${uuid}:body:regularDelete`, range.dx, range.dy)}
          >
            <div>
              删除{" "}
              <McIcon size="12" color="red">
                delete
              </McIcon>
            </div>
          </McEditorMenu>
        </>
      )}

      {(menu & MceMenu.Replace) === MceMenu.Replace && showMenu && (
        <>
          <McEditorMenu
            x={prefix.x + prefix.cw + prefix.w}
            y={prefix.y}
            w={prefix.w + 24}
            h={prefix.h / 2 - 1}
            onClick={() => bus.emit(`mc-${uuid}:body:replace`, range.dx, range.dy, "a")}
          >
            <div>
              替换一 <McIcon>send</McIcon>
            </div>
          </McEditorMenu>
          <McEditorMenu
            x={prefix.x + prefix.cw + prefix.w}
            y={prefix.y + prefix.h / 2 + 1}
            w={prefix.w + 24}
            h={prefix.h / 2 - 1}
            onClick={() => bus.emit(`mc-${uuid}:body:replace`, range.dx, range.dy, "b")}
          >
            <div>
              替换二 <McIcon>send</McIcon>
            </div>
          </McEditorMenu>
          <McEditorMenu
            x={suffix.x}
            y={suffix.y}
            w={suffix.w + 24}
            h={suffix.h / 2 - 1}
            onClick={() => bus.emit(`mc-${uuid}:body:replace`, range.dx, range.dy, "a")}
          >
            <div>
              替换一 <McIcon>send</McIcon>
            </div>
          </McEditorMenu>
          <McEditorMenu
            x={suffix.x}
            y={suffix.y + suffix.h / 2 + 1}
            w={suffix.w + 24}
            h={suffix.h / 2 - 1}
            onClick={() => bus.emit(`mc-${uuid}:body:replace`, range.dx, range.dy, "b")}
          >
            <div>
              替换二 <McIcon>send</McIcon>
            </div>
          </McEditorMenu>
        </>
      )}
    </div>
  );
};

export default McEditorBody;

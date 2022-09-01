import McEditorCell from "./cell";
import McEditorMenu from "./menu";
import McEditorContext from "./context";
import McIcon from "components/mc-icon";
import usePrefix from "./hooks/usePrefix";
import useSuffix from "./hooks/useSuffix";
import { MceFlag, MceMenu } from "mce/typing";
import React, { FC, useContext } from "react";
import { FIELDS } from "misc/util";

interface IProps {
  hash: McTelegramHash;
  flag: MceFlag;
  menu: MceMenu;
  highlight: string;
  direction: "rx" | "tx";
}

const fields = FIELDS;

const McEditorHead: FC<IProps> = ({ menu, highlight, ...rest }) => {
  const { bus, uuid, range } = useContext(McEditorContext);
  const prefix = usePrefix(uuid, range, "head");
  const suffix = useSuffix(uuid, range, "head");

  return (
    <div className="mc-editor-head">
      <div className="mc-editor__row">
        <div
          className="mc-editor__col mc-editor__col--long"
          style={{
            width: "calc((100% - 20px) * 0.2)",
          }}
        >
          {rest.direction === "rx" ? "来自" : "发往"}
        </div>
        <div
          className="mc-editor__col mc-editor__col--short"
          style={{
            width: "calc((100% - 20px) * 0.2)",
          }}
        >
          号数
        </div>
        <div className="mc-editor__col mc-editor__col--short">组数</div>
        <div className="mc-editor__col mc-editor__col--short">等级</div>
        <div className="mc-editor__col mc-editor__col--long">月日</div>
        <div className="mc-editor__col mc-editor__col--long">时分</div>
        <div
          className="mc-editor__col mc-editor__col--long"
          style={{
            width: "calc((100% - 20px) * 0.2 + 20px)",
          }}
        >
          记时签名
        </div>
      </div>
      <div className="mc-editor__row">
        <div
          className="mc-editor__col"
          style={{
            width: "calc((100% - 20px) * 0.2)",
          }}
        >
          <McEditorCell
            max={8}
            role="head"
            field={rest.direction === "rx" ? "FROM" : "TO"}
            index={0}
            maxLength={20}
            highlighting={false}
            {...rest}
          />
        </div>
        <div
          className="mc-editor__col"
          style={{
            width: "calc((100% - 20px) * 0.2)",
          }}
        >
          <McEditorCell
            max={8}
            role="head"
            field="NR"
            index={1}
            maxLength={100}
            autoFocus={true}
            highlighting={highlight === "NR"}
            {...rest}
          />
        </div>
        <div className="mc-editor__col">
          <McEditorCell
            max={8}
            role="head"
            field="CK"
            index={2}
            maxLength={20}
            highlighting={highlight === "CK"}
            {...rest}
          />
        </div>
        <div className="mc-editor__col">
          <McEditorCell
            max={8}
            role="head"
            field="CLS"
            index={3}
            maxLength={20}
            highlighting={highlight === "CLS"}
            {...rest}
          />
        </div>
        <div className="mc-editor__col">
          <McEditorCell
            max={8}
            role="head"
            field="DATE"
            index={4}
            maxLength={20}
            highlighting={highlight === "DATE"}
            {...rest}
          />
        </div>
        <div className="mc-editor__col">
          <McEditorCell
            max={8}
            role="head"
            field="TIME"
            index={5}
            maxLength={20}
            highlighting={highlight === "TIME"}
            {...rest}
          />
        </div>
        <div
          className="mc-editor__col"
          style={{
            width: "calc((100% - 20px) * 0.2 + 20px)",
          }}
        >
          <McEditorCell
            max={8}
            role="head"
            field="SIGN"
            index={6}
            maxLength={20}
            highlighting={highlight === "false"}
            {...rest}
          />
        </div>
      </div>
      <div className="mc-editor__row">
        <div
          className="mc-editor__col mc-editor__col--long"
          style={{
            width: "calc((100% - 20px) * 0.2)",
          }}
        >
          附注
        </div>
        <div
          className="mc-editor__col"
          style={{
            width: "calc((100% - 20px) * 0.8 + 20px)",
          }}
        >
          <McEditorCell
            max={8}
            role="head"
            field="RMKS"
            index={7}
            maxLength={1000}
            allowSpace
            highlighting={highlight === "RMKS"}
            {...rest}
          />
        </div>
      </div>

      {/*{(menu & MceMenu.Prefix) === MceMenu.Prefix && "tx" === rest.direction && (*/}
      {(menu & MceMenu.Prefix) === MceMenu.Prefix && (
        // { true && (
        <McEditorMenu
          x={prefix.x}
          y={prefix.y}
          w={prefix.w}
          h={prefix.h}
          onClick={() => bus.emit(`mc-${uuid}:head:send`, fields[range.dx] || "")}
        >
          <McIcon>rotate</McIcon>
          <div>{"tx" === rest.direction ? "重发" : "请求重发"}</div>
          <div>此组报头</div>
        </McEditorMenu>
      )}
      {(menu & MceMenu.Prefix) === MceMenu.Prefix && (
        <McEditorMenu
          x={prefix.x}
          y={prefix.y + prefix.h}
          w={prefix.w}
          h={prefix.h}
          onClick={() => bus.emit(`mc-${uuid}:head:send`, "PBL")}
        >
          <McIcon>rotate</McIcon>
          <div>{"tx" === rest.direction ? "重发" : "请求重发"}</div>
          <div>完整报头</div>
        </McEditorMenu>
      )}
      {"tx" === rest.direction && (menu & MceMenu.Prefix) === MceMenu.Prefix && (
        <McEditorMenu
          x={prefix.x}
          y={prefix.y + prefix.h * 2}
          w={prefix.w}
          h={prefix.h}
          onClick={() => bus.emit(`mc-${uuid}:head:send`, "PBLNEW")}
        >
          <McIcon>send</McIcon>
          <div>{"tx" === rest.direction ? "发送" : "请求重发"}</div>
          <div>完整报头</div>
        </McEditorMenu>
      )}

      {/*{(menu & MceMenu.Suffix) === MceMenu.Suffix && (*/}

      {/*/!*{(menu & MceMenu.Suffix) === MceMenu.Suffix && (*!/*/}
      {/*{(menu & MceMenu.Suffix) === MceMenu.Suffix && "tx" === rest.direction && (*/}
      {/*// { true && (*/}
      {/*  <McEditorMenu*/}
      {/*    x={suffix.x}*/}
      {/*    y={suffix.y}*/}
      {/*    w={suffix.w}*/}
      {/*    h={suffix.h}*/}
      {/*    onClick={() => bus.emit(`mc-${uuid}:head:send`, fields[range.dx] || "")}*/}
      {/*  >*/}
      {/*    <McIcon>send</McIcon>*/}
      {/*    <div>{"tx" === rest.direction ? "重发" : "请求重发"}</div>*/}
      {/*    <div>所选报头</div>*/}
      {/*  </McEditorMenu>*/}
      {/*)}*/}

      {(menu & MceMenu.Replace) === MceMenu.Replace && (
        <>
          <McEditorMenu
            x={suffix.x}
            y={suffix.y}
            w={suffix.w + 24}
            h={suffix.h / 2 - 1}
            onClick={() => bus.emit(`mc-${uuid}:head:replace`, fields[range.dx], "a")}
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
            onClick={() => bus.emit(`mc-${uuid}:head:replace`, fields[range.dx], "b")}
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

export default McEditorHead;

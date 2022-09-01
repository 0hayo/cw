import McEditorMenu from "./menu";
import McEditorCell from "./cell";
import McIcon from "components/mc-icon";
import McEditorContext from "./context";
import usePrefix from "./hooks/usePrefix";
import useSuffix from "./hooks/useSuffix";
import { MceFlag, MceMenu } from "mce/typing";
import React, { FC, useContext } from "react";

interface IProps {
  hash: McTelegramHash;
  flag: MceFlag;
  menu: MceMenu;
  direction: "rx" | "tx";
}

const fields = ["FROM", "NR", "TIME", "SIGN", "RMKS", "TO"];

const McEditorHead: FC<IProps> = ({ menu, ...rest }) => {
  const { bus, uuid, range } = useContext(McEditorContext);
  const prefix = usePrefix(uuid, range, "head");
  const suffix = useSuffix(uuid, range, "head");

  return (
    <div className="mc-ex-editor-head">
      <div className="mc-ex-editor__row">
        <div
          className="mc-ex-editor__col mc-ex-editor__col--long"
          style={{
            width: "30%",
          }}
        >
          {rest.direction === "rx" ? "来自" : "发往"}
        </div>
        <div
          className="mc-ex-editor__col mc-ex-editor__col--long"
          style={{
            width: "25%",
          }}
        >
          号数
        </div>
        <div
          className="mc-ex-editor__col mc-ex-editor__col--long"
          style={{
            width: "20%",
          }}
        >
          时间
        </div>
        <div
          className="mc-ex-editor__col mc-ex-editor__col--long"
          style={{
            width: "25%",
          }}
        >
          记时/签名
        </div>
      </div>
      <div className="mc-ex-editor__row">
        <div
          className="mc-ex-editor__col"
          style={{
            width: "30%",
          }}
        >
          <McEditorCell
            role="head"
            field={rest.direction === "rx" ? "FROM" : "TO"}
            index={0}
            maxLength={20}
            {...rest}
          />
        </div>
        <div
          className="mc-ex-editor__col"
          style={{
            width: "25%",
          }}
        >
          <McEditorCell role="head" field="NR" index={1} maxLength={100} {...rest} />
        </div>
        <div
          className="mc-ex-editor__col"
          style={{
            width: "20%",
          }}
        >
          <McEditorCell role="head" field="TIME" index={2} maxLength={20} {...rest} />
        </div>
        <div
          className="mc-ex-editor__col"
          style={{
            width: "25%",
          }}
        >
          <McEditorCell role="head" field="SIGN" index={3} maxLength={20} {...rest} />
        </div>
      </div>
      <div className="mc-ex-editor__row">
        <div
          className="mc-ex-editor__col mc-ex-editor__col--long"
          style={{
            width: "30%",
          }}
        >
          附注
        </div>
        <div
          className="mc-ex-editor__col"
          style={{
            width: "70%",
          }}
        >
          <McEditorCell role="head" field="RMKS" index={4} maxLength={1000} allowSpace {...rest} />
        </div>
      </div>

      {(menu & MceMenu.Prefix) === MceMenu.Prefix && (
        <McEditorMenu
          x={prefix.x}
          y={prefix.y}
          w={prefix.w}
          h={prefix.h}
          onClick={() => bus.emit(`mc-${uuid}:head:mark`, fields[range.dx] || "")}
        >
          <McIcon>mark</McIcon>
          <div>重发</div>
          <div>完整报头</div>
        </McEditorMenu>
      )}

      {(menu & MceMenu.Suffix) === MceMenu.Suffix && (
        <McEditorMenu
          x={suffix.x}
          y={suffix.y}
          w={suffix.w}
          h={suffix.h}
          onClick={() => bus.emit(`mc-${uuid}:head:send`, fields[range.dx] || "")}
        >
          <McIcon>send</McIcon>
          <div>重发</div>
          <div>所选报头</div>
        </McEditorMenu>
      )}
    </div>
  );
};

export default McEditorHead;

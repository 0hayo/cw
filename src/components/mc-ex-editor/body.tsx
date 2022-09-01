import McEditorMenu from "./menu";
import McEditorCell from "./cell";
import McEditorContext from "./context";
import McIcon from "components/mc-icon";
import useSuffix from "./hooks/useSuffix";
import { MceFlag, MceMenu } from "mce/typing";
import React, { FC, useContext } from "react";

interface IProps {
  hash: McTelegramHash;
  flag: MceFlag;
  menu: MceMenu;
}

const McEditorBody: FC<IProps> = ({ menu, ...rest }) => {
  const { bus, uuid, range } = useContext(McEditorContext);
  const suffix = useSuffix(uuid, range, "body");

  return (
    <div className="mc-ex-editor-body">
      <div className="mc-ex-editor__row" style={{}}>
        {/* <div
          // className="mc-ex-editor__col mc-ex-editor__col--long"
          className="mc-ex-editor__col"
          style={{
            width: "30%",
          }}
        >
          内容
        </div> */}
        <div
          className="mc-ex-editor__col mc-ex-editor__content"
          style={{
            width: "100%",
          }}
        >
          <McEditorCell role="body" field="0" index={0} maxLength={40} {...rest} />
        </div>
      </div>

      {(menu & MceMenu.Suffix) === MceMenu.Suffix && (
        <McEditorMenu
          x={suffix.x}
          y={suffix.y}
          w={suffix.w}
          h={suffix.h}
          onClick={() => bus.emit(`mc-${uuid}:body:send`, range.dx, range.dy)}
        >
          <McIcon>send</McIcon>
          <div>重发</div>
          <div>报文</div>
        </McEditorMenu>
      )}
    </div>
  );
};

export default McEditorBody;

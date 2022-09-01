import "./styles/editor.less";
import McEditorHead from "./head";
import McEditorBody from "./body";
import useBus from "hooks/useBus";
import useGuid from "hooks/useGuid";
import useMci from "./hooks/useMci";
import useRange from "./hooks/useRange";
import McEditorContext from "./context";
import React, { FC, useEffect } from "react";
import { MceMenu, MceFlag, MceInstance } from "mce/typing";
import { index2field } from "misc/util";

interface IProps {
  offset: number;
  head: McTelegramHash;
  body: McTelegramHash;
  flag?: MceFlag;
  menu?: MceMenu;
  onReady?: (mci: MceInstance) => void;
  readonly?: boolean;
  highlight?: { index: number; role: "body" | "head" }; //高亮body哪一格
  direction: "rx" | "tx";
  image?: boolean;
  type: TelegramBizType;
}

const McEditor: FC<IProps> = ({
  head,
  body,
  offset,
  onReady,
  readonly = false,
  highlight = { index: -1, role: "body" },
  flag = MceFlag.None,
  menu = MceMenu.None,
  direction,
  image = true,
  type = "CW",
}) => {
  const bus = useBus();
  const uuid = useGuid();
  const mci = useMci({ bus, uuid });
  const range = useRange({ bus, uuid });

  useEffect(() => {
    onReady && onReady(mci);
    // eslint-disable-next-line
  }, []);

  return (
    <McEditorContext.Provider
      value={{
        bus,
        uuid,
        range,
        readonly,
      }}
    >
      <div id={`mc-${uuid}`} className="mc-editor">
        <McEditorHead
          hash={head}
          flag={flag}
          menu={menu}
          direction={direction}
          highlight={highlight.role === "head" ? index2field(highlight.index, type, "head") : ""}
        />
        <McEditorBody
          hash={body}
          flag={flag}
          menu={menu}
          offset={offset}
          direction={direction}
          highlight={highlight.role === "body" ? highlight.index : -1}
          image={image}
        />
      </div>
    </McEditorContext.Provider>
  );
};

export default McEditor;

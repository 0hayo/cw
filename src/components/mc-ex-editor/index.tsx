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

interface IProps {
  head: McTelegramHash;
  body: McTelegramHash;
  flag?: MceFlag;
  menu?: MceMenu;
  direction?: "rx" | "tx";
  onReady?: (mci: MceInstance) => void;
  readonly?: boolean;
}

const McExEditor: FC<IProps> = ({
  head,
  body,
  onReady,
  readonly = false,
  direction = "rx",
  flag = MceFlag.None,
  menu = MceMenu.None,
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
      <div id={`mc-${uuid}`} className="mc-ex-editor">
        <McEditorHead hash={head} flag={flag} menu={menu} direction={direction} />
        <McEditorBody hash={body} flag={flag} menu={menu} />
      </div>
    </McEditorContext.Provider>
  );
};

export default McExEditor;

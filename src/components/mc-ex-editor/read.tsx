import "./styles/group.less";
import React, { FC } from "react";
import classnames from "classnames";
import McEditorRatio from "./ratio";
import { MceFlag } from "mce/typing";
import useRead from "./hooks/useRead";

interface IProps {
  index: number;
  field: string;
  flag: MceFlag;
  hash: McTelegramHash;
  role: "head" | "body";
}

const McRead: FC<IProps> = ({ role, flag, hash, index, field }) => {
  const word = hash[field];
  const event = useRead({ role, index, field });

  return (
    <div
      className={classnames("mc-ex-editor__cell mc-ex-editor__cell--hover", {
        "mc-ex-editor__cell--diff": word && word.state === "diff",
        "mc-ex-editor__cell--pass": word && word.state === "pass",
        "mc-ex-editor__cell--active": event.active,
      })}
      onClick={event.handleClick}
      onDoubleClick={event.handleDblClick}
    >
      {(() => {
        if (word && word.extra && word.extra !== word.value) {
          return (
            <div className="mc-ex-editor-group">
              <div>{word.value}</div>
              <div className="mc-editor-group__divider" />
              <div>{word.extra}</div>
            </div>
          );
        }

        if (word && word.value) {
          return (
            <div className="mc-ex-editor-group">
              <div>{word.value}</div>
              {word.ratio && (flag & MceFlag.Ratio) === MceFlag.Ratio && (
                <McEditorRatio value={word.ratio} />
              )}
            </div>
          );
        }
      })()}

      {(() => {
        if (word && word.crude && word.crude !== word.value) {
          return <span className="mc-ex-editor__tl">{word.crude}</span>;
        }
      })()}
    </div>
  );
};

export default McRead;

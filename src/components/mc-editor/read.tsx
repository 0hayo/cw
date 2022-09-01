import "./styles/group.less";
import React, { FC } from "react";
import classnames from "classnames";
import McEditorRatio from "./ratio";
import { MceFlag } from "mce/typing";
import useRead from "./hooks/useRead";

interface IProps {
  max: number;
  flag: MceFlag;
  index: number;
  field: string;
  hash: McTelegramHash;
  role: "head" | "body";
  highlighting: boolean;
}

const McRead: FC<IProps> = ({ max, hash, role, flag, index, field, highlighting }) => {
  const word = hash[field];
  const event = useRead({ role, index, field });

  return (
    <div
      className={classnames("mc-editor__cell mc-editor__cell--hover", {
        "mc-editor__cell--pass": word && word.state === "pass",
        "mc-editor__cell--diff": word && word.state === "diff",
        "mc-editor__cell--warn": word && word.warn,
        "mc-editor__cell--active": event.active || (word && word.state === "active"),
        "mc-editor__cell--light": (word && word.light) || highlighting,
      })}
      onClick={event.handleClick}
      onDoubleClick={event.handleDblClick}
      onMouseDown={event.handleClick}
      onMouseEnter={event.handleMouseSelect}
      onMouseLeave={event.handleMouseOut}
      onContextMenu={event.handleContextMenu}
    >
      {(() => {
        if (word && word.extra && word.extra !== word.value) {
          return (
            <div className="mc-editor-group">
              <div>{word.value}</div>
              <div className="mc-editor-group__divider" />
              <div>{word.extra}</div>
            </div>
          );
        }

        if (word && word.value) {
          return (
            <div className="mc-editor-group">
              <div>{word.value}</div>
              {word.ratio && (flag & MceFlag.Ratio) === MceFlag.Ratio && (
                <McEditorRatio value={word.ratio} />
              )}
            </div>
          );
        }
      })()}

      {(() => {
        if (word && role === "body" && max === index) {
          return <span className="mc-editor__br">_</span>;
        }

        if (word && index % 100 === 99) {
          return <span className="mc-editor__br">_</span>;
        }
      })()}

      {(() => {
        let text = "";
        if (role === "body" && index % 100 === 0) {
          text += index / 100 + 1 + "P* ";
        }

        if (text) {
          return <span className="mc-editor__pg">{text}</span>;
        }
      })()}
      {(() => {
        let text = "";
        if (word && word.crude && word.crude !== word.value) {
          text += word.crude;
        }

        if (text) {
          return <span className="mc-editor__tl">{text}</span>;
        }
      })()}
    </div>
  );
};

export default McRead;

import "./styles/input.less";
import classnames from "classnames";
import useEdit from "./hooks/useEdit";
import McEditorContext from "./context";
import React, { FC, useContext } from "react";

interface IProps {
  index: number;
  field: string;
  hash: McTelegramHash;
  role: "head" | "body";
  maxLength?: number;
  allowSpace?: boolean;
}

const McEdit: FC<IProps> = ({
  role,
  hash,
  index,
  field,
  maxLength,
  allowSpace = false,
}) => {
  const word = hash[field];
  const { uuid } = useContext(McEditorContext);
  const event = useEdit({ role, index, field, allowSpace });

  return (
    <div
      className={classnames("mc-ex-editor__cell", {
        "mc-ex-editor__cell--diff": word && word.state === "diff",
      })}
    >
      <input
        id={`mc-${uuid}--${role}--${index}`}
        type="text"
        value={word ? word.value : ""}
        onChange={event.handleChange}
        onKeyDown={event.handleKeyDown}
        onBlur={event.handleBlur}
        maxLength={maxLength}
        className="mc-ex-editor-input"
      />

      {(() => {
        let text = "";

        if (word && word.crude && word.value !== word.crude) {
          text += word.crude;
        }

        if (text) {
          return <span className="mc-ex-editor__tl">{text}</span>;
        }
      })()}
    </div>
  );
};

export default McEdit;

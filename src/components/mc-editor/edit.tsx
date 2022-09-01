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
  autoFocus?: boolean;
  highlighting: boolean;
  image?: boolean;
}

const McEdit: FC<IProps> = ({
  hash,
  role,
  index,
  field,
  maxLength,
  allowSpace = false,
  autoFocus = false,
  highlighting = false,
  image = true,
}) => {
  const word = hash[field];
  const { uuid } = useContext(McEditorContext);
  const event = useEdit({ role, index, field, allowSpace });

  return (
    <div
      className={classnames("mc-editor__cell", {
        "mc-editor__cell--light": (word && word.light) || highlighting,
        "mc-editor__cell--warn": word && word.warn,
        "mc-editor__cell--diff": word && word.state === "diff",
        "mc-editor__cell--active": event.active,
      })}
    >
      <input
        id={`mc-${uuid}--${role}--${index}`}
        type="text"
        value={word ? word.value : ""}
        onChange={event.handleChange}
        onKeyDown={event.handleKeyDown}
        onClick={event.handleClick}
        onFocus={event.handleFocus}
        onBlur={event.handleBlur}
        onMouseEnter={event.handleMouseSelect}
        onMouseLeave={event.handleMouseOut}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className="mc-editor-input"
        spellCheck={false}
        style={
          word && word.image && image
            ? {
                backgroundImage: `url(${word.image})`,
              }
            : {}
        }
      />

      {(() => {
        let text = "";
        // if (role === "body" && index % 100 === 0) {
        //   text += index / 100 + 1 + "P* ";
        // }

        if (word && word.crude && word.value !== word.crude) {
          text += word.crude;
        }

        if (text) {
          return <span className="mc-editor__tl">{text}</span>;
        }
      })()}
    </div>
  );
};

export default McEdit;

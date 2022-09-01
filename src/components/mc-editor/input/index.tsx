import "./index.less";
import "../styles/editor.less";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import McEditorHead from "../head";
import { MceFlag, MceInstance, MceMenu } from "mce/typing";
import McBlock from "components/mc-block";
import TextArea, { TextAreaRef } from "antd/lib/input/TextArea";
import useBus from "hooks/useBus";
import useGuid from "hooks/useGuid";
import useMci from "../hooks/useMci";
import useRange from "../hooks/useRange";
import McEditorContext from "../context";
import { index2field } from "misc/util";
import os from "os";
import { cover, trim } from "misc/telegram";

interface IProps {
  head: McTelegramHash;
  body: McTelegramHash;
  direction: "rx" | "tx";
  type: TelegramBizType;
  highlight?: { index: number; role: "body" | "head" }; //高亮body哪一格
  onReady?: (mci: MceInstance) => void;
  onBodyChange: (body: McTelegramHash) => void;
}

const NEW_LINE = os.EOL;
// const END = NEW_LINE + NEW_LINE + "END";
const REGEX_TMPL = /\s\s\s\s*--(.*)--/g;

const McTelegramEditor: FC<IProps> = ({
  head,
  body,
  direction,
  type,
  highlight = { index: -1, role: "body" },
  onReady,
  onBodyChange,
}) => {
  const bus = useBus();
  const uuid = useGuid();
  const mci = useMci({ bus, uuid });
  const range = useRange({ bus, uuid });
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const textRef = useRef<TextAreaRef>();

  useEffect(() => {
    onReady && onReady(mci);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const textArea = textRef.current.resizableTextArea.textArea;
    const scrollTop = textArea.scrollTop;
    const cursorPosition = textArea ? textArea.selectionStart : 0;
    let _text = "";
    Object.keys(body).map((key, idx) => {
      let value = body[key]?.value;
      if (!value) value = "";
      if (idx % 10 === 0) {
        _text += value;
      } else if (idx % 10 === 9) {
        _text += " " + value + NEW_LINE;
        if (idx % 100 === 99) {
          //
          let separator = "                                   --" + (idx + 1) + "--" + NEW_LINE;
          const len = (idx + 1 + "").length;
          for (var i = 0; i < 10 - len; i++) {
            separator = " " + separator;
          }
          _text += separator;
        }
      } else {
        _text += " " + value;
      }
      return key;
    });
    // _text && (_text = _text + END);
    setText(_text);
    setTimeout(() => {
      textArea && textArea.setSelectionRange(cursorPosition, cursorPosition);
      textArea.scrollTo({ left: 0, top: scrollTop });
    }, 5);
  }, [body]);

  useEffect(() => {
    setEditText(text);
  }, [text]);

  const parseBody = useCallback(
    (newText: string) => {
      //去除页分隔符
      // const _temp = newText.replace(REGEX_TMPL, "").replace(END, "").replaceAll(NEW_LINE, " ");
      const _temp = newText.trim().replace(REGEX_TMPL, "").replaceAll(NEW_LINE, " ");
      const codeArr = _temp.split(" ");
      const newBody = trim(cover(body, 0, codeArr));
      onBodyChange(newBody);
    },
    [body, onBodyChange]
  );

  return (
    <McEditorContext.Provider
      value={{
        bus,
        uuid,
        range,
        readonly: false,
      }}
    >
      <McBlock className="mc-telegram-editor">
        <div className="editor-head">
          <McEditorHead
            hash={head}
            flag={MceFlag.None}
            menu={MceMenu.None}
            direction={direction}
            highlight={highlight.role === "head" ? index2field(highlight.index, type, "head") : ""}
          />
        </div>
        <div className="editor-body">
          <TextArea
            ref={textRef}
            className="editor-body-input"
            placeholder="请输入或粘贴报文内容"
            spellCheck={false}
            onChange={e => {
              const val = e.currentTarget.value;
              setEditText(val);
              parseBody(e.currentTarget.value.toUpperCase());
            }}
            value={editText}
          ></TextArea>
        </div>
      </McBlock>
    </McEditorContext.Provider>
  );
};

export default McTelegramEditor;

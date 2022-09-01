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

interface IProps {
  head: McTelegramHash;
  body: McTelegramHash;
  direction: "rx" | "tx";
  onReady?: (mci: MceInstance) => void;
  onBodyChange: (body: McTelegramHash) => void;
}

const McTelegramExEditor: FC<IProps> = ({ head, body, direction, onReady, onBodyChange }) => {
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
    const _text = body && body[0] ? body[0].value : "";
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
      const newBody = {
        0: { value: newText },
      };
      onBodyChange(newBody);
    },
    [onBodyChange]
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
      <McBlock className="mc-telegram-ex-editor">
        <div className="editor-head">
          <McEditorHead hash={head} flag={MceFlag.None} menu={MceMenu.None} direction={direction} />
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
              parseBody(val.toUpperCase());
            }}
            value={editText}
          ></TextArea>
        </div>
      </McBlock>
    </McEditorContext.Provider>
  );
};

export default McTelegramExEditor;

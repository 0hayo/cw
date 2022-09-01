import "./index.less";
import React, { FC, useRef, useState, useEffect } from "react";
import { EditOutlined, CloseCircleOutlined, SaveOutlined } from "@ant-design/icons";
import { Modal } from "antd";

interface ItemProps {
  id: number;
  code: string;
  text: string;
  type: "rx" | "tx";
  mode: "edit" | "save" | "preset" | "new";
  onDrop?: (id: number) => void;
  onSave?: (code: string, text: string, type: "rx" | "tx", id: number) => void;
}

// 勤务短语
const PhraseItem: FC<ItemProps> = props => {
  const [code, setCode] = useState(props.code);
  const [text, setText] = useState(props.text);
  const [mode, setMode] = useState<"edit" | "save" | "preset" | "new">(props.mode);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ref = inputRef.current;
    if (ref) ref.focus();
  }, [mode]);

  return (
    <div className="phrase_content_list_item">
      <div className="list_left">
        <div className="list_name"></div>
        <input
          className="list_input"
          value={text}
          readOnly={mode === "edit" || mode === "preset"}
          onChange={event => {
            setText(event.currentTarget.value);
          }}
        />
      </div>
      <div className="list_right">
        <div className="list_name"></div>
        <input
          className="list_input"
          ref={mode === "save" || mode === "new" ? inputRef : null}
          value={code}
          readOnly={mode === "edit"}
          onChange={e => setCode(e.currentTarget.value.toUpperCase())}
        ></input>
      </div>
      <div className="list_edit">
        {mode === "edit" ? (
          <EditOutlined
            className="list_left_icon"
            onClick={e => {
              setMode("save");
            }}
          />
        ) : (
          <SaveOutlined
            className="list_left_icon"
            onClick={e => {
              props.onSave(code, text, props.type, props.id);
              setMode("edit");
            }}
          />
        )}
        <CloseCircleOutlined
          className="list_left_icon"
          onClick={() => {
            if (mode === "new") {
              props.onDrop(props.id);
            } else {
              Modal.confirm({
                centered: true,
                maskClosable: false,
                content: "您确定要删除本条勤务短语吗？",
                onOk: () => props.onDrop(props.id),
              });
            }
          }}
        />
      </div>
    </div>
  );
};

export default PhraseItem;

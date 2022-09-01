import "./index.less";
import React, { FC, useRef, useState, useEffect } from "react";
import { Modal } from "antd";
import { FormOutlined, DeleteOutlined, DoubleRightOutlined } from "@ant-design/icons";

interface ItemProps {
  id: number;
  text: string;
  mode: "edit" | "save" | "new";
  active?: string;
  onDrop?: (id: number) => void;
  onSave?: (text: string, id?: number) => void;
  onActive?: (name: string) => void;
}

// 勤务短语
const GroupItem: FC<ItemProps> = props => {
  const [text, setText] = useState(props.text);
  const [mode, setMode] = useState<"edit" | "save" | "new">(props.mode);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ref = inputRef.current;
    if (ref) ref.focus();
  }, [mode]);

  return (
    <>
      <div className="controller_list" onClick={e => props.onActive(props.id + "")}>
        <div className={`controller_list_left ${props.text === props.active ? "active" : null}`}>
          {mode === "edit" ? (
            <>
              <div className="list_text">{text}</div>
              <DeleteOutlined
                className="list_icon"
                onClick={() => {
                  Modal.confirm({
                    centered: true,
                    maskClosable: false,
                    content: `您确定要删除班组 "${text}"以及班组中的所有用户吗？`,
                    onOk: () => props.onDrop(props.id),
                  });
                }}
              />
              <FormOutlined
                className="list_icon margin"
                onClick={() => {
                  setMode("save");
                }}
              />
            </>
          ) : (
            <input
              className="list_input"
              ref={inputRef}
              value={text}
              onChange={e => setText(e.currentTarget.value)}
              onBlur={e => {
                setMode("edit");
                props.onSave(e.currentTarget.value, props.id);
                if (mode === "new") props.onDrop(props.id);
              }}
            />
          )}
        </div>
        <div className={`controller_list_icon ${props.text === props.active ? "isShow" : null}`}>
          <DoubleRightOutlined />
        </div>
      </div>
    </>
  );
};

export default GroupItem;

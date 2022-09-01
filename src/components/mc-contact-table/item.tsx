import "./index.less";
import React, { FC, useEffect, useState } from "react";
import { EditOutlined } from "@ant-design/icons";

interface IProps {
  contactTable: ISysContactTable;
  active: boolean;
  isNew?: boolean;
  onDrop?: (id: number) => void;
  onSave?: (data: ISysContactTable) => void;
  onSelect?: (id: number) => void;
}

// 联络表信息
const ContactTableItem: FC<IProps> = ({
  contactTable,
  active,
  isNew = false,
  onDrop,
  onSave,
  onSelect,
}) => {
  const [edit, setEdit] = useState(isNew);
  const [data, setData] = useState(contactTable);

  useEffect(() => {
    const keyEventHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEdit(false);
      }
    };
    document.body.addEventListener("keydown", keyEventHandler);
    return () => document.body.removeEventListener("keydown", keyEventHandler);
  }, []);

  return (
    <>
      <div className="controller_list" onClick={e => onSelect && onSelect(data?.id)}>
        <div className={`controller_list_left ${active ? "active" : null}`}>
          {!edit ? (
            <>
              <div className="list_text">{data?.contactName}</div>
              <div>
                <EditOutlined
                  className="list_icon margin"
                  onClick={() => {
                    setEdit(true);
                  }}
                />
                {/* <CloseCircleOutlined
                  className="list_icon"
                  onClick={() => {
                    Modal.confirm({
                      centered: true,
                      maskClosable: false,
                      content: "您确定要删除吗？",
                      onOk: () => onDrop(data?.id),
                    });
                  }}
                /> */}
              </div>
            </>
          ) : (
            <input
              autoFocus={true}
              className="list_input"
              value={data?.contactName}
              placeholder="请输入联络文件名称"
              onChange={e => setData({ ...data, contactName: e.currentTarget.value })}
              onBlur={e => {
                data.contactName && onSave(data);
                setEdit(false);
                if (isNew) onDrop(data.id);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ContactTableItem;

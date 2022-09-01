import "./index.less";
import React, { FC, useEffect, useMemo, useState } from "react";
import TelegramIecPanel from "./iec-code";
import ContactTableItem from "./item";
import MaskCodePanel from "./mask-code";
import TelegramCodePanel from "./telegram-code";
import TelegramGradePanel from "./telegram-grade";
import useContactTable from "./useContactTable";
import useForm from "./useForm";
import Checkbox from "antd/es/checkbox";
import McButton from "components/mc-button";
import { PlusCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import { getContactId, LOCAL_MACHINE_ID, setContactId } from "misc/env";
import { useLocation } from "react-router";
import qs from "query-string";
import RadioService from "services/radio-service";
import message from "misc/message";
import withTabbar from "hoc/withTabbar";

interface IProps {
  contactId?: string;
  readonly?: boolean;
  showName?: boolean;
}

const EMPTY_CONTACT_TABLE: ISysContactTable = {
  contactName: "",
};

// 联络文件表管理
const ContactTableSetting: FC<IProps> = ({ contactId, readonly = false, showName = false }) => {
  const [form, setForm, setProps] = useForm();
  const [radio, setRadio] = useState<IRadioItem>();

  // 获取联络表列表数据
  const { remove, save } = useContactTable(form, setForm);
  const [currContactId, setCurrContactId] = useState(getContactId());
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);

  useEffect(() => {
    const queryContactId = search.contactId || contactId;
    queryContactId &&
      form.contactTables &&
      form.contactTables.map(it => {
        if (it.id + "" === queryContactId) {
          setProps("activeContactTable")(it);
        }
        return it;
      });
  }, [form.contactTables, search.contactId, contactId, setProps]);

  useEffect(() => {
    RadioService.getRadio(LOCAL_MACHINE_ID).then(data => {
      setRadio(data);
      form.contactTables.map(it => {
        if (it.id === radio?.contactId) {
          setProps("activeContactTable")(it);
        }
        return it;
      });
    });
  }, [form.contactTables, radio?.contactId, setProps]);

  useEffect(() => {
    const keyEventHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProps("add")(false);
      }
    };
    document.body.addEventListener("keydown", keyEventHandler);
    return () => document.body.removeEventListener("keydown", keyEventHandler);
  }, [setProps]);

  return (
    <div className="home-contact_table">
      <div className="controller">
        {showName && <div className="contact-name">{form.activeContactTable?.contactName}</div>}
        {!readonly && (
          <div className="controller_ul">
            {
              // 遍历联络表信息
              form.contactTables.map(item => {
                return (
                  <ContactTableItem
                    key={item.id}
                    contactTable={item}
                    active={form.activeContactTable.id === item.id}
                    onSelect={id =>
                      setProps("activeContactTable")(form.contactTables.find(x => x.id === id))
                    }
                    onSave={item => save(item)}
                    onDrop={id => remove(id)}
                  />
                );
              })
            }
            {form.add && (
              <ContactTableItem
                active={true}
                contactTable={EMPTY_CONTACT_TABLE}
                isNew={true}
                onSave={data => {
                  save(data);
                }}
                onDrop={e => setProps("add")(false)}
              />
            )}
            <div className="active add" onClick={e => setProps("add")(true)}>
              <PlusCircleOutlined title="新建联络文件" />
            </div>
          </div>
        )}
        <div
          className="controller_content"
          style={
            readonly ? { backgroundColor: "transparent", margin: 0, padding: 0 } : { padding: 16 }
          }
        >
          {!readonly && (
            <div className="contact_table_row_0">
              <McButton
                type="link"
                // size="large"
                danger
                onClick={() => {
                  Modal.confirm({
                    title: "删除联络文件",
                    centered: true,
                    maskClosable: false,
                    content: `确定要删除联络文件:"${form.activeContactTable.contactName}"？`,
                    onOk: () => remove(form.activeContactTable?.id),
                  });
                }}
              >
                <DeleteOutlined /> 删除
              </McButton>
              <div className="">
                <Checkbox
                  checked={currContactId === form.activeContactTable?.id + ""}
                  onChange={e => {
                    const checked = e.target.checked;
                    const current = currContactId === form.activeContactTable?.id + "";
                    if (checked && !current) {
                      const _radio = { ...radio, contactId: form.activeContactTable.id };
                      setRadio(_radio);
                      RadioService.saveRadio(_radio).then(success => {
                        if (success) {
                          setContactId(form.activeContactTable.id + "");
                          setCurrContactId(form.activeContactTable.id + "");
                          message.success("设置默认联络文件成功！");
                          window.location.reload();
                        } else {
                          message.failure("设置默认联络文件失败！");
                        }
                      });
                    }
                  }}
                >
                  设为默认
                </Checkbox>
              </div>
            </div>
          )}
          <div className="contact_table_row_1">
            <TelegramCodePanel contactId={form.activeContactTable?.id} readonly={readonly} />
            <TelegramGradePanel contactId={form.activeContactTable?.id} readonly={readonly} />
          </div>
          <div className="contact_table_row_2">
            <TelegramIecPanel contactId={form.activeContactTable?.id} readonly={readonly} />
            <MaskCodePanel contactId={form.activeContactTable?.id} readonly={readonly} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withTabbar(ContactTableSetting)("setting-contact");

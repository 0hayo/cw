import McCommonSelect from "components/mc-common-select";
import React, { FC, useState } from "react";
import ContactTableService from "services/contact-table-service";
import { Input, Modal } from "antd";
import { SaveOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import RadioService from "services/radio-service";
import message from "misc/message";
import McButton from "components/mc-button";
import { logInfo } from "misc/util";

interface IProps {
  data: IRadioItem;
  onSave: (radio: IRadioItem) => void;
  onDelete: (radio: IRadioItem) => void;
}

const DeviceCard: FC<IProps> = ({ data, onSave, onDelete }) => {
  const [item, setItem] = useState(data);
  const [edit, setEdit] = useState(false);

  const checkSave = (): boolean => {
    if (!item.name) {
      message.failure("请输入终端名称！");
      return false;
    }
    if (!item.contactId) {
      message.failure("请指定终端工作网系！");
      return false;
    }
    if (!item.ip) {
      message.failure("请输入终端IP地址！");
      return false;
    }
    return true;
  };

  return (
    <div className="device_list" key={item.uuid}>
      <div className="device_list_edit_btn">
        {edit ? (
          <SaveOutlined
            className="edit_btn save_btn"
            onClick={() => {
              if (!checkSave) return;
              RadioService.saveRadio(item).then(result => {
                if (result) {
                  onSave(item);
                  setEdit(false);
                  logInfo("保存终端信息成功");
                  message.success("保存终端信息成功！");
                } else {
                  logInfo("保存终端信息失败");
                  message.failure("保存终端信息失败！");
                }
              });
            }}
          />
        ) : (
          <>
            <EditOutlined
              className="edit_btn"
              onClick={() => {
                setEdit(true);
              }}
            />
            <DeleteOutlined
              className="edit_btn"
              onClick={() => {
                Modal.confirm({
                  title: "删除终端设备",
                  content: `确定要删除终端设备：${item.name} ?`,
                  maskClosable: false,
                  okType: "danger",
                  onOk: () => {
                    RadioService.deleteRadio(item.uuid).then(result => {
                      if (result) {
                        logInfo(`删除终端${item.name}成功！`);
                        message.success(`删除终端${item.name}成功！`);
                        onDelete(item);
                      } else {
                        logInfo(`删除终端${item.name}失败！`);
                        message.failure(`删除终端${item.name}失败！`);
                      }
                    });
                  },
                });
              }}
            />
          </>
        )}
      </div>
      <div className="device_list_title">{item.name}</div>
      <div className="device_content_from">
        <div className="content_from_list">
          <div className="content_from_name">终端名称:</div>
          <div className="content_from_flex">
            <div className="content_from_text" title={item.name}>
              {edit ? (
                <Input
                  value={item.name}
                  onChange={e => setItem({ ...item, name: e.currentTarget.value })}
                />
              ) : (
                item.name
              )}
            </div>
          </div>
        </div>
        <div className="content_from_list">
          <div className="content_from_name">终端IP:</div>
          <div className="content_from_flex">
            <div className="content_from_text">
              {edit ? (
                <Input
                  value={item.ip}
                  onChange={e => setItem({ ...item, ip: e.currentTarget.value })}
                />
              ) : (
                item.ip
              )}
            </div>
          </div>
        </div>
        <div className="content_from_list">
          <div className="content_from_name">授权状态:</div>
          <div className="content_from_flex">
            <div
              className={`content_from_text ${
                item.authorizationFlag === 1
                  ? "content_from_text_green"
                  : "content_from_text_warning"
              }`}
            >
              {item.authorizationFlag === 1 ? "允许接入 " : "未授权接入 "}
              {item.authorizationFlag === 1 ? (
                <McButton
                  className="auth-btn"
                  type="primary"
                  warning
                  onClick={() => {
                    Modal.confirm({
                      title: "取消终端接入授权",
                      content: `确定要取消${item.name}的接入授权？ 取消后终端将无法接入总控系统。`,
                      okType: "danger",
                      centered: true,
                      maskClosable: false,
                      onOk: () => {
                        setItem({ ...item, authorizationFlag: 0 });
                        RadioService.saveRadio({ ...item, authorizationFlag: 0 }).then(result => {
                          if (result) {
                            message.success(`取消终端${item.name}授权成功！`);
                            logInfo(`取消终端${item.name}授权成功！`);
                            onSave(item);
                          } else {
                            message.failure(`取消终端${item.name}授权失败！`);
                            logInfo(`取消终端${item.name}授权失败！`);
                          }
                        });
                      },
                    });
                  }}
                >
                  取消授权
                </McButton>
              ) : (
                <McButton
                  className="auth-btn"
                  type="primary"
                  onClick={() => {
                    Modal.confirm({
                      title: "终端接入授权",
                      content: `确定要授权终端${item.name}接入系统？`,
                      okType: "danger",
                      maskClosable: false,
                      centered: true,
                      onOk: () => {
                        if (!item.contactId) {
                          message.warning("请先指定终端的工作网系，再点击保存按钮。");
                          setEdit(true);
                          setItem({ ...item, authorizationFlag: 1 });
                        } else {
                          if (!checkSave) return;
                          setItem({ ...item, authorizationFlag: 1 });
                          RadioService.saveRadio({ ...item, authorizationFlag: 1 }).then(result => {
                            if (result) {
                              message.destroy();
                              message.success(`终端授权${item.name}成功！`);
                              logInfo(`终端授权${item.name}成功！`);
                              onSave(item);
                            } else {
                              message.failure(`终端授权${item.name}失败！`);
                              logInfo(`终端授权${item.name}失败！`);
                            }
                          });
                        }
                      },
                    });
                  }}
                >
                  授权接入
                </McButton>
              )}
            </div>
          </div>
        </div>
        <div className="content_from_list">
          <div className="content_from_name">工作网系:</div>
          <div className="content_from_flex">
            <div className="content_from_select">
              <McCommonSelect
                idPropName="id"
                readonly={!edit}
                valuePropName="contactName"
                items={ContactTableService.getAllContactTables}
                onChange={(data: ISysContactTable) => {
                  if (data) {
                    setItem({ ...item, contactId: data.id });
                  } else {
                    setItem({ ...item, contactId: null });
                  }
                }}
                allowAll={false}
                itemName="所属网系"
                selectedId={item.contactId + ""}
              />
            </div>
          </div>
        </div>
        <div className="content_from_list">
          <div className="content_from_name">终端型号:</div>
          <div className="content_from_flex">
            <div className="content_from_text">
              {edit ? (
                <Input
                  value={item.type}
                  onChange={e => setItem({ ...item, type: e.currentTarget.value })}
                />
              ) : (
                item.type
              )}
            </div>
          </div>
        </div>
        <div className="content_from_list">
          <div className="content_from_name">终端机器ID:</div>
          <div className="content_from_flex">
            <div className="content_from_text_wrap content_from_text_readonly">{item.uuid}</div>
          </div>
        </div>
        <div className="content_from_list">
          <div className="content_from_name">人工智能核心库:</div>
          <div className="content_from_flex">
            <div className="content_from_text">{item.libraryVersion}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;

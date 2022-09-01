import "./index.less";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Checkbox, Modal } from "antd";
import { CheckOutlined, CloseOutlined, UserDeleteOutlined } from "@ant-design/icons";
import message from "misc/message";
import useTaskState from "hooks/useState";
import McDictDropdown from "components/mc-dictionary-dropdown";
import McTelegramPreview from "components/mc-telegram-preview";
import McCommonSelect from "components/mc-common-select";
import ContactTableService from "services/contact-table-service";
import RadioService from "services/radio-service";
import McIcon from "components/mc-icon";
import { MstTheme } from "less/theme";
import useCmdSender from "socket/command-sender";
import useCmdAckHandler from "./useCmdAckHandler";
import { useHistory } from "react-router";
import McButton from "components/mc-button";
import xmeta from "services/xmeta";

interface IProps {
  type: TaskType;
  currTask?: ITask;
  radioUuid?: string;
  telegram?: ITelegram;
  contactTableId?: number;
  onCancel?: VoidFunction;
  onOk?: VoidFunction;
}

// const dateTimeFormat = "YYYY-MM-DD HH:mm";

/**
 * 执行任务前的确认对话框
 */
const McTaskExecModal: FC<IProps> = ({
  type,
  telegram,
  currTask,
  radioUuid,
  contactTableId,
  onCancel,
  onOk,
}) => {
  const EMPTY_TASK: ITask = {
    completeFlag: 0,
    radioUuid: "",
    name: "",
    title: "",
    type: type,
    remindLength: 10,
  };
  const send = useCmdSender();
  const history = useHistory();
  const [preTeleUuid, setPreTeleUuid] = useState<string>();

  const [task, , setTaskProp] = useTaskState(currTask || EMPTY_TASK);
  const [contactId, setContactId] = useState<number>(contactTableId);
  const [deviceList, setDeviceList] = useState<IRadioItem[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<IRadioItem>();
  const [contactList, setContactList] = useState<ISysContactTable[]>([]);
  const [update, setUpdate] = useState(1);
  const [readyToGo, setReadyToGo] = useState(false);
  const [telegramMeta, setTelegramMeta] = useState<McTelegramMeta>();
  const refReadyToGo = useRef(readyToGo);
  const refDevice = useRef(selectedDevice);
  const refContactId = useRef(contactId);

  const [initBizType, setInitBizType] = useState(task.bizType || telegramMeta?.type);

  //Get telegram meta
  useEffect(() => {
    (async () => {
      if (telegram?.uuid) {
        const meta = await xmeta.readServer(telegram.uuid);
        setTelegramMeta(meta);
        if (meta && meta.type) {
          setInitBizType(meta.type);
          setTaskProp("bizType")(meta.type);
        }
      }
    })();
  }, [telegram?.uuid, setTaskProp]);

  useEffect(() => {
    refReadyToGo.current = readyToGo;
  }, [readyToGo]);

  useEffect(() => {
    refDevice.current = selectedDevice;
  }, [selectedDevice]);

  const processCmdAck = (ackData: AckData) => {
    const cmd = ackData.cmd;
    const _radioUuid = ackData.radioUuid;
    const rc = ackData.rc;
    setTimeout(() => {
      if (
        cmd === "ctControlRadio-ack" &&
        rc === 1 &&
        _radioUuid === refDevice.current?.uuid &&
        refReadyToGo.current
      ) {
        onOk && onOk();
        gotoCW();
      }
    }, 1000);
  };

  useCmdAckHandler(processCmdAck);

  const gotoCW = useCallback(() => {
    if (type === "1") {
      //发报
      history.push(
        `/cw?mode=tx&datagramType=TELS&contactId=${refContactId.current}${
          task?.id ? "&taskUuid=" + task.id : ""
        }${telegram ? "&dir=" + telegram.uuid : ""}&type=${task.bizType}&original=exec`
      );
    } else {
      //收报
      history.push(
        `/cw?mode=rx&datagramType=TELR&contactId=${refContactId.current}${
          task?.id ? "&taskUuid=" + task.id : ""
        }&type=${task.bizType}`
      );
    }
  }, [task, history, telegram, type]);

  const onSubmit = () => {
    message.destroy();
    if (!contactId) return message.failure("请选择网系");
    if (!selectedDevice) return message.failure("请选择执行任务的终端");
    if (!task.bizType) return message.failure("请选择电报类型");
    console.log("selected device 3 =", selectedDevice);

    if (selectedDevice.contactId !== contactId) {
      Modal.confirm({
        centered: true,
        maskClosable: false,
        title: "终端网系不同",
        content: (
          <>
            <p>
              您选择的作业网系为:"<b>{getContactName(contactId)}</b>"
            </p>
            <p>
              您选择的终端"{selectedDevice.name}"的工作网系为:"
              <b>{getContactName(selectedDevice.contactId)}</b>"
            </p>
            <p>请确认终端连接的电台可以工作在目标网系。</p>
            <p>是否要继续操作？</p>
          </>
        ),
        onOk: () => {
          confirmControlDevice();
        },
        onCancel: () => {
          return false;
        },
      });
    } else {
      confirmControlDevice();
    }
  };

  const confirmControlDevice = useCallback(() => {
    if (!selectedDevice) return;
    const controlledDevice = deviceList.find(x => x.status === 1);
    if (selectedDevice.status === 0) {
      Modal.confirm({
        centered: true,
        maskClosable: false,
        title: "接管终端",
        content: (
          <>
            <p>
              {`您选择的终端"${selectedDevice.name}"`}
              {`当前不是接管状态，选择继续将接管该终端${
                controlledDevice ? "，其他已接管的终端将被释放" : ""
              }。`}
            </p>
            <p>是否要继续操作？</p>
          </>
        ),
        onOk: () => {
          //先释放其他被接管的终端
          deviceList.map(it => {
            if (it.status === 1 && it.uuid !== selectedDevice.uuid) {
              const cmd: Command = {
                cmd: "ctReleaseRadio",
                radioUuid: it.uuid,
                data: {
                  radioUuid: it.uuid,
                },
              };
              send(cmd);
            }
            return it;
          });
          //接管选中的终端
          const cmd: Command = {
            cmd: "ctControlRadio",
            radioUuid: selectedDevice.uuid,
            data: {
              radioUuid: selectedDevice.uuid,
            },
          };
          send(cmd);
          setReadyToGo(true);
        },
        onCancel: () => {
          return false;
        },
      });
    } else {
      // setReadyToGo(true);
      onOk && onOk();
      gotoCW();
    }
  }, [deviceList, selectedDevice, gotoCW, onOk, send]);

  // 加载智能收发设备列表、网系列表
  useEffect(() => {
    ContactTableService.getAllContactTables().then(data => setContactList(data));
  }, []);

  useEffect(() => {
    RadioService.getAllRadios().then(data => setDeviceList(data));
  }, [update]);

  useEffect(() => {
    const device = deviceList.find(x => x.uuid === selectedDevice?.uuid || x.uuid === radioUuid);
    setSelectedDevice(device);
  }, [deviceList, selectedDevice?.uuid, radioUuid]);

  //更新终端状态
  useEffect(() => {
    const i = setTimeout(() => {
      setUpdate(update + 1);
    }, 3000);
    return () => {
      clearTimeout(i);
    };
  }, [update]);

  /** 获取网系名称 */
  const getContactName = (contactId: number) => {
    const contactTable = contactList?.find(it => it.id === contactId);
    return contactTable?.contactName || "";
  };

  return (
    <Modal
      centered
      visible
      className="mc_task_exec_modal"
      closable={false}
      footer={null}
      onCancel={onCancel}
      onOk={onSubmit}
      destroyOnClose
      maskClosable={false}
    >
      <div className="modal_head">
        <UserDeleteOutlined className="head_icon" />
        执行{type === "1" ? "发" : "收"}报任务
      </div>
      <div className="modal_content">
        {/* 所属网系 */}
        <div className="modal_list">
          <div className="modal_list_name">选择联络网系:</div>
          <div className="modal_list_select">
            <McCommonSelect
              idPropName="id"
              valuePropName="contactName"
              allowAll={false}
              itemName="联络网系"
              selectedId={contactId + ""}
              items={ContactTableService.getAllContactTables}
              onChange={(data: ISysContactTable) => {
                if (data) {
                  setContactId(data.id);
                  refContactId.current = data.id;
                } else {
                  setContactId(undefined);
                  refContactId.current = undefined;
                }
              }}
            />
          </div>
        </div>
        {/* 选择终端 */}
        <div className="modal_list">
          <div className="modal_list_name">选择执行任务的终端:</div>
          <div className="modal_device_list">
            {deviceList &&
              deviceList
                // .sort((a, b) => (a.contactId === contactId ? -1 : 1))
                .map(it => (
                  <div
                    className={`device-card ${
                      it.uuid === selectedDevice?.uuid ? "device-card-active" : ""
                    }`}
                    style={{
                      cursor:
                        (it.status !== 0 && it.status !== 1) || it.workStatus !== 0
                          ? "not-allowed"
                          : "pointer",
                    }}
                    key={`mc-radio-slector-${it.uuid}`}
                    onClick={() => {
                      message.destroy();
                      if (it.status === -1)
                        return message.failure(
                          "无法选择此终端",
                          `终端"${it.name}"当前为离线状态，无法接管。`
                        );
                      if (it.status === -2)
                        return message.failure(
                          "无法选择此终端",
                          `终端"${it.name}"当前未授权接入，无法接管。`
                        );
                      if (it.status === -3)
                        return message.failure(
                          "无法选择此终端",
                          `终端"${it.name}"当前处于脱网模式，无法接管。`
                        );
                      if (it.workStatus === 1)
                        return message.failure(
                          "无法选择此终端",
                          `终端"${it.name}"当前正在执行发报任务，无法接管。`
                        );
                      if (it.workStatus === 2)
                        return message.failure(
                          "无法选择此终端",
                          `终端"${it.name}"当前正在执行收报任务，无法接管。`
                        );
                      setSelectedDevice(it);
                    }}
                  >
                    <Checkbox checked={it.uuid === selectedDevice?.uuid} />
                    <McIcon
                      color={
                        it.uuid === selectedDevice?.uuid
                          ? MstTheme.mc_green_color
                          : MstTheme.mc_text_color
                      }
                      size={24}
                    >
                      radio
                    </McIcon>
                    <div className="device-name" title={it.name}>
                      {it.name}
                    </div>
                    <div className="device-contact-name" title={getContactName(it.contactId)}>
                      ({getContactName(it.contactId)})
                    </div>
                    <div
                      className="device-status"
                      style={{
                        color:
                          it.status === 0
                            ? MstTheme.mc_green_color
                            : it.status === 1
                            ? MstTheme.mc_warning_color
                            : MstTheme.mc_danger_color,
                      }}
                    >
                      {it.status === 0
                        ? "在线"
                        : it.status === 1
                        ? "已接管"
                        : it.status === -1
                        ? "离线"
                        : "未注册"}
                    </div>
                    {it.status !== -1 && (
                      <div
                        className="device-status"
                        style={{
                          color:
                            it.workStatus === 0
                              ? MstTheme.mc_green_color
                              : MstTheme.mc_warning_color,
                        }}
                      >
                        {it.workStatus === 0
                          ? "待机"
                          : it.workStatus === 1
                          ? "正在发报"
                          : it.workStatus === 2
                          ? "正在收报"
                          : ""}
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </div>
        {/* 发报任务显示电子报底 */}
        {type === "1" && (
          <div className="modal_list">
            <div className="modal_list_name">电子报底:</div>
            <div className="task_telegram_wrapper">
              <div className="task_telegrams">
                {task.datagrams && task.datagrams.length > 0 ? (
                  task.datagrams?.map(taskTelegram => (
                    <div
                      className="task_telegram_name"
                      key={`mc-task-telegram-link-${taskTelegram.uuid}`}
                    >
                      <div
                        className="task_telegram_link"
                        onClick={() => setPreTeleUuid(taskTelegram.uuid)}
                      >
                        <McIcon>file-search</McIcon> : {taskTelegram.title}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="task_telegram_name"
                    key={`mc-task-telegram-link-${telegram?.uuid}`}
                  >
                    <div
                      className="task_telegram_link"
                      onClick={() => setPreTeleUuid(telegram?.uuid)}
                    >
                      <McIcon>file-search</McIcon> : {telegram?.title}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* 业务类型 */}
        <div className="modal_list">
          {(task.bizType || telegramMeta?.type) && initBizType ? (
            "电报类型: " +
            ((task.bizType ? task.bizType : telegramMeta?.type) === "CCK"
              ? "CW"
              : task.bizType
              ? task.bizType
              : telegramMeta?.type)
          ) : (
            <>
              <div className="modal_list_name">电报类型:</div>
              <div className="modal_list_select">
                <McDictDropdown
                  dictType="draft_type"
                  name="电报类型"
                  defaultValue={task.bizType}
                  onChange={dictItem => setTaskProp("bizType")(dictItem?.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="modal_footer">
        <McButton type="primary" className="modal_Btn" danger onClick={onSubmit}>
          {type === "1" ? "立即发报" : "立即收报"} <CheckOutlined />
        </McButton>
        <McButton type="primary" className="modal_Btn" onClick={onCancel}>
          取消 <CloseOutlined />
        </McButton>
      </div>

      {/* 预览报文弹窗 */}
      {preTeleUuid && (
        <McTelegramPreview telegramUuid={preTeleUuid} onClose={() => setPreTeleUuid(null)} />
      )}
    </Modal>
  );
};

export default McTaskExecModal;

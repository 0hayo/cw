import "./index.less";
import React, { FC, useEffect, useState } from "react";
import { Button, Modal, Radio, DatePicker, Input, Select } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  UserDeleteOutlined,
  ContainerOutlined,
} from "@ant-design/icons";
import fetch from "utils/fetch";
import message from "misc/message";
import McTelegramModal from "components/mc-telegram-modal";
import moment from "moment";
import useTaskState from "hooks/useState";
import McTelegramPreview from "components/mc-telegram-preview";
import ContactTableService from "services/contact-table-service";
import { getAppType } from "misc/env";
import { isArray } from "lodash";
import McDictDropdown from "components/mc-dictionary-dropdown";
import xmeta from "services/xmeta";
import { CloseCircleFilled } from "@ant-design/icons";

interface IProps {
  mode: "add" | "edit";
  radioUuid?: string;
  contactTableId?: number;
  currTask?: ITask;
  onCancel?: VoidFunction;
  onOk?: (task: ITask) => void;
}

const DEFAULT_REMIND_MINUTES = 30;
const dateTimeFormat = "YYYY-MM-DD HH:mm";
const EMPTY_TASK: ITask = {
  completeFlag: 0,
  radioUuid: "",
  name: "",
  title: "",
  type: undefined,
  remindLength: DEFAULT_REMIND_MINUTES,
};

const McTaskModal: FC<IProps> = ({ mode, radioUuid, contactTableId, currTask, onCancel, onOk }) => {
  // 待发报文弹窗控制
  const [showTelegramModal, setShowTelegramModal] = useState<boolean>(false);
  const [preTeleUuid, setPreTeleUuid] = useState<string>();
  // const [devName, setDevName] = useState<string>("");
  const [task, setTask, setTaskProp] = useTaskState(currTask || EMPTY_TASK);

  const [contactList, setContactList] = useState<ISysContactTable[]>([]);

  const [contactId, setContactId] = useState<number>(contactTableId);
  const { Option } = Select;
  const appType = getAppType();

  useEffect(() => {
    return () => {
      // alert(contactTableId);
      setTask(x => ({
        ...x,
        contactTableId: contactTableId,
      }));
    };
  }, [contactTableId, setTask]);

  //当电子报底发生变化时，获取报底的报文类型（CW、EX），更新电报类型显示
  useEffect(() => {
    (async () => {
      if (task?.datagramUuid) {
        const meta = await xmeta.readServer(task?.datagramUuid);
        if (meta && meta.type && meta.type !== task.bizType) {
          setTask(x => ({ ...x, bizType: meta.type === "CCK" ? "CW" : meta.type }));
        } else {
          if (task.type === "1") {
            message.warning("电报类型无法确定", "您选择的电子报底无法确定电报类型，请重新选择。");
            setTask(x => ({ ...x, bizType: "" }));
          }
        }
      }
    })();
    //eslint-disable-next-line
  }, [task?.datagramUuid, task?.type, setTask]);

  // 请求智能收发设备列表
  useEffect(() => {
    ContactTableService.getAllContactTables().then(data => setContactList(data));
    //eslint-disable-next-line
  }, [radioUuid]);

  // 提交指派任务
  const onSubmit = () => {
    // if (!task.radioUuid) return message.failure("请选择设备");
    // alert(task.contactTableId);
    if (!contactId) return message.failure("请选择网系");
    if (!task.type) return message.failure("请选择工作开始方式");
    if (task.type === "2" && !task.bizType) return message.failure("收报任务需要选择电报类型");
    if (!task.name || task.name.trim() === "") return message.failure("请输入任务名称");
    if (!task.startTime) return message.failure("请选择任务开始时间");
    const _remindTime = moment(task.startTime);
    _remindTime.subtract(task.remindLength, "minutes");
    console.log("task.uuid", task.datagramUuid);
    const postParm = {
      contactTableId: contactId,
      bizType: task.bizType,
      workType: task.workType,
      radioUuid: task.radioUuid,
      name: task.name,
      startTime: moment(task.startTime).format("YYYY-MM-DD HH:mm:ss"),
      datagrams: task.datagramUuid ? [{ uuid: task.datagramUuid }] : task.datagrams,
      type: task.type,
      remindTime: _remindTime.format("YYYY-MM-DD HH:mm:ss"),
      remindLength: task.remindLength,
      completeFlag: 0,
    };
    if (mode === "edit" && task.id) Object.assign(postParm, { id: task.id });
    const wait =
      mode === "add"
        ? fetch.post<ManageResponse>("/sysTask/insert", JSON.stringify(postParm))
        : fetch.put<ManageResponse>("/sysTask/update", JSON.stringify(postParm));
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) {
        message.success(mode === "add" ? "创建任务成功" : "修改任务成功");
        onOk && onOk(task);
      }
    });
  };

  const unlinkTelegram = (telegramUuid: string) => {
    const telegrams = task.datagrams?.filter(x => x.uuid !== telegramUuid);
    setTaskProp("datagrams")(telegrams);
    setTaskProp("datagramUuid")("");
  };

  const changeTaskType = (taskType: "1" | "2") => {
    // let _taskName = task.name;
    // if (_taskName === "发报任务-" || _taskName === "收报任务-" || !_taskName) {
    //   _taskName = taskType === "1" ? "发报任务-" : "收报任务-";
    // }
    setTask({
      ...task,
      type: taskType,
      // name: _taskName,
    });
  };

  const range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  return (
    <Modal
      centered
      visible
      className="mc_task_modal"
      closable={false}
      footer={null}
      onCancel={onCancel}
      onOk={onSubmit}
      destroyOnClose
      maskClosable={false}
    >
      <div className="modal_head">
        <UserDeleteOutlined className="head_icon" />
        {mode === "add" ? "指派任务" : "修改任务"}
      </div>
      <div className="modal_content">
        {/* 选择网系 */}
        <div className="modal_list">
          <div className="modal_list_name">选择网系:</div>
          <div className="modal_list_select">
            {/*<McDeviceDropdown*/}
            {/*  all={false}*/}
            {/*  radioUuid={radioUuid}*/}
            {/*  onChange={radio => {*/}
            {/*    // setProps({ ...propsData, radioUuidCurrent: e });*/}
            {/*    setTaskProp("radioUuid")(radio?.uuid || "");*/}
            {/*    setDevName(radio?.name);*/}
            {/*  }}*/}
            {/*/>*/}

            <Select
              disabled={appType === "terminal" ? true : false}
              dropdownClassName="downSelect"
              className="select"
              style={{ width: 150, height: 20 }}
              // defaultValue={mode === "edit" ? radioUuidCurrent : "所有设备"}
              value={contactId}
              onChange={(value, option) => {
                // alert(value);
                setContactId(value);
                setTaskProp("contactTableId")(value);
              }}
            >
              {contactList &&
                isArray(contactList) &&
                contactList.map(item => (
                  <Option value={item.id} key={item.id}>
                    {item.contactName}
                  </Option>
                ))}
            </Select>
          </div>
        </div>
        {/* 收发类型 */}
        <div className="modal_list">
          <div className="modal_list_name">收发类型:</div>
          <Radio.Group
            onChange={e => changeTaskType(e.target.value)}
            // defaultValue={mode === "edit" && workType}
            defaultValue={task.type}
            value={task.type}
            disabled={mode !== "add"}
          >
            <Radio value={"1"}>作为发方</Radio>
            <Radio value={"2"}>作为收方</Radio>
          </Radio.Group>
        </div>
        {/* 任务名称 */}
        <div className="modal_list">
          <div className="modal_list_name">任务名称:</div>
          <Input
            className="modal_list_input"
            placeholder="请在此输入任务名称"
            value={task.name}
            onChange={e => setTaskProp("name")(e.target.value)}
          />
        </div>
        {/* 任务开始时间 */}
        <div className="modal_list">
          <div className="modal_list_name">任务开始时间:</div>
          <DatePicker
            className="modal_list_time"
            placeholder="请选择任务开始时间"
            suffixIcon={<CloseCircleFilled />}
            showTime={{ showSecond: false, format: "YYYY-MM-DD HH:mm" }}
            value={task.startTime ? moment(task.startTime) : null}
            format={dateTimeFormat}
            disabledDate={current => {
              return current && current < moment().startOf("day");
            }}
            disabledTime={selected => {
              const now = moment();
              const currentHour = now.get("hour");
              const currentMinute = now.get("minute") + 1;
              return {
                disabledHours: () => (now.isBefore(selected) ? [] : range(0, currentHour)),
                disabledMinutes: () => (now.isBefore(selected) ? [] : range(0, currentMinute)),
                disabledSeconds: () => [],
              };
            }}
            onChange={(e, dateString) =>
              setTaskProp("startTime")(
                dateString ? moment(dateString).format("YYYY-MM-DD HH:mm") : null
              )
            }
          ></DatePicker>
        </div>
        {/* 电子报底 */}
        {task.type === "1" && (
          <div className="modal_list">
            <div className="modal_list_name">电子报底:</div>
            <div className="task_telegram_wrapper">
              <div className="task_telegrams">
                {task.datagrams?.map(telegram => (
                  <div
                    className="task_telegram_name"
                    key={`mc-task-telegram-link-${telegram.uuid}`}
                  >
                    <div
                      className="task_telegram_link"
                      onClick={() => setPreTeleUuid(telegram.uuid)}
                    >
                      {telegram.type === "1" ? "发" : "收"}: {telegram.title}
                    </div>
                    <div className="task_telegram_btn">
                      {telegram.type === "1" && (
                        <CloseOutlined onClick={() => unlinkTelegram(telegram.uuid)} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button
              type="primary"
              onClick={e => setShowTelegramModal(true)}
              disabled={task.type === "1" ? false : true}
            >
              选择电子报底 <ContainerOutlined />
            </Button>
          </div>
        )}

        {/* 电报类型 --- 只有收報的時候才選*/}
        <div className="modal_list">
          {task.type === "2" ? (
            <>
              <div className="modal_list_name">电报类型:</div>
              <div className="modal_list_select">
                <McDictDropdown
                  dictType="draft_type"
                  name="电报类型"
                  defaultValue={task.bizType}
                  onChange={dictItem => setTaskProp("bizType")(dictItem.value)}
                />
              </div>
            </>
          ) : (
            <div className="modal_list_name">电报类型:{task.bizType}</div>
          )}
        </div>

        <div className="modal_list">
          <div className="modal_list_name">任务开始前提醒:</div>
          <Radio.Group
            onChange={e => setTaskProp("remindLength")(e.target.value)}
            defaultValue={DEFAULT_REMIND_MINUTES}
            value={task.remindLength}
          >
            <Radio value={10}>10分钟</Radio>
            <Radio value={20}>20分钟</Radio>
            <Radio value={30}>30分钟</Radio>
          </Radio.Group>
        </div>
      </div>
      <div className="modal_footer">
        <Button type="primary" className="modal_Btn" onClick={onSubmit}>
          确认 <CheckOutlined />
        </Button>
        <Button type="primary" onClick={onCancel}>
          取消 <CloseOutlined />
        </Button>
      </div>

      {/* 选择待发报文 */}
      <McTelegramModal
        visible={showTelegramModal}
        onCancel={() => {
          setShowTelegramModal(false);
        }}
        onOk={(title, datagramUuid, radioUuid) => {
          // setProps({ ...propsData, datagramUuid: uuid, datagramTitle: name, radioUuid });
          setTask({
            ...task,
            datagrams: [{ title, type: "1", uuid: datagramUuid }],
            datagramUuid,
            title,
          });
          setShowTelegramModal(false);
        }}
      />
      {/* 预览报文弹窗 */}
      {preTeleUuid && (
        <McTelegramPreview telegramUuid={preTeleUuid} onClose={() => setPreTeleUuid(null)} />
      )}
    </Modal>
  );
};

export default McTaskModal;

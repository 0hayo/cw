import "./index.less";
import React, { FC, useState, ReactNode, useEffect } from "react";
import { Button } from "antd";
import InfiniteScroll from "react-infinite-scroller";
import McTaskModal from "components/mc-task-model";
// import useRemove from "./useRemove";
import { SearchOutlined, SendOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { MstTheme } from "less/theme";
import { useHistory } from "react-router";
// import McDeviceDropdown from "components/mc-devices-dropdown";
import moment from "moment";
import DictionaryService from "services/dictionary-service";
import guid from "misc/guid";
import McTelegramPreview from "components/mc-telegram-preview";
// import fetch from "utils/fetch";
import McModal from "components/mc-modal";
import { getAppType } from "misc/env";
import McTaskExecModal from "components/mc-exec-task-modal";
import AudioFilePlayer from "components/mc-audio-player/audio-file-player";
import { isArray } from "lodash";
import ContactTableService from "services/contact-table-service";
import fetch from "utils/fetch";

interface IProps {
  contactTableId?: number;
  className?: string;
  pageSize?: number;
  tasks?: ITask[];
  /** 是否播放警示音，默认为true */
  alert?: boolean;
  onClose?: () => void;
}
// interface IContactList {
//   items: IContactListItem[];
// }
// interface IContactListItem {
//   id: number;
//   contactName: string;
// }

const McTaskRemindList: FC<IProps> = ({
  contactTableId,
  className,
  pageSize = 15,
  tasks,
  alert = true,
  onClose,
}) => {
  const history = useHistory();
  // const [show, setShow] = useState(true);

  // 新任务弹窗
  const [taskModal, setTaskModal] = useState<"add" | "edit" | "hide">("hide");
  const [preTeleUuid, setPreTeleUuid] = useState<string>();
  const [taskList, setTaskList] = useState<ITask[]>(tasks);
  const [currTask, setCurrTask] = useState<ITask>();
  // const [pages, setPages] = useState<IFormPages>({
  //   currentPage: 1,
  //   pageSize: pageSize,
  //   completeFlag: 0, //完成标志
  //   contactTableId: contactTableId,
  //   orderStr: "start_time desc",
  // });
  const [showExecModal, setShowExecModal] = useState(false);

  const [goAlert, setGoAlert] = useState(alert);
  const stopAlert = () => {
    setGoAlert(false);
  };

  /**
   * 根据网系ID重新查询任务列表
   */
  useEffect(() => {
    const fetchUrl = contactTableId
      ? `/sysTask/remind_tasks?contactId=${contactTableId}`
      : "/sysTask/remind_tasks";
    fetch.get(fetchUrl).then(response => {
      console.log("remind_tasks ======", response);
      if (response.data && response.data.status === 1 && response.data.data) {
        setTaskList(response.data.data);
      }
    });
  }, [contactTableId]);

  /** 点击鼠标或键盘时停止报警 */
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      stopAlert();
    };
    const keyHandler = (e: KeyboardEvent) => {
      stopAlert();
    };
    document.body.addEventListener("click", clickHandler);
    document.body.addEventListener("keydown", keyHandler);
    return () => {
      document.body.removeEventListener("click", clickHandler);
      document.body.removeEventListener("keydown", keyHandler);
    };
  }, []);

  const [contactList, setContactList] = useState<ISysContactTable[]>([]);
  // 加载网系列表
  useEffect(() => {
    ContactTableService.getAllContactTables().then(data => setContactList(data));
  }, []);

  /** 获取网系名称 */
  const getContactName = (contactId: number) => {
    const contactTable = contactList?.find(it => it.id === contactId);
    return contactTable?.contactName || "";
  };

  const getDisplayTime = (datetime: string, type: "plan" | "finished"): ReactNode => {
    const currDatetime = moment();
    const taskDatetime = moment(datetime);
    const yearDiff = currDatetime.year() - taskDatetime.year();
    const isToday = currDatetime.date() === taskDatetime.date();
    const isBefore = taskDatetime.isBefore(currDatetime);

    let className = "task_time";
    let displayStr = datetime;
    if (isBefore && type !== "finished") {
      className = className + " task_time_danger";
    }

    if (yearDiff > 0) {
      displayStr = taskDatetime.format("YYYY年M月D日 HH:mm");
    } else if (isToday) {
      displayStr = "今天 " + taskDatetime.format("HH:mm");
      className = className + " task_time_warn";
    } else {
      displayStr = taskDatetime.format("M月D日 HH:mm");
    }
    return <div className={className}>{displayStr}</div>;
  };

  return (
    <McModal
      className={`mc-task-remind-list ${className ? className : ""}`}
      title="定时任务提醒"
      closable={true}
      visible={true}
      centered={true}
      destroyOnClose
      width={900}
      okText="关闭"
      cancelButtonProps={{ style: { display: "none" } }}
      maskClosable={false}
      okButtonProps={{
        style: { backgroundColor: MstTheme.mc_primary_color, margin: "-8px 16px 8px 0" },
      }}
      onOk={() => {
        onClose && onClose();
      }}
      onCancel={() => {
        onClose && onClose();
      }}
      maskStyle={
        goAlert
          ? {
              animation: "task-alert 1000ms infinite",
              WebkitAnimation: "task-alert 1000ms infinite",
            }
          : {}
      }
    >
      <div className="remind-task-list">
        <div className="tips">
          {taskList && taskList.length > 0
            ? "下列任务即将到期或已超期，请及时进行处理。"
            : "所有任务都已经按计划执行，目前没有到期或已超期的任务。"}
        </div>
        <div className="task_ul">
          {taskList ? (
            <InfiniteScroll
              initialLoad={false}
              pageStart={0}
              loadMore={() => {
                return false;
              }}
              style={{ height: "600px" }}
            >
              {taskList && isArray(taskList)
                ? taskList.map(item => {
                    return (
                      <div className="task_list" key={`mc-task-list-${guid()}`}>
                        <div className="task_list_left">
                          <div className="task_list_left_name" title={item.name}>
                            {item.name}
                          </div>
                          <div className="task_list_left_dev">
                            {getContactName(item.contactTableId)}
                          </div>
                          {item.completeFlag === 0 ? (
                            <div className="task_time_wrapper">
                              计划时间：{getDisplayTime(item.startTime, "plan")}
                            </div>
                          ) : (
                            <div className="task_time_wrapper">
                              完成时间：{getDisplayTime(item.endTime, "finished")}
                            </div>
                          )}
                        </div>
                        <div className="task_list_content">
                          <div className="content_type">
                            <div
                              className="content_sub_type"
                              style={{
                                color:
                                  item.type === "1"
                                    ? MstTheme.mc_primary_color
                                    : MstTheme.mc_warning_color,
                              }}
                            >
                              {item.type === "1" ? "发方" : "收方"}
                            </div>
                            <div className="content_sub_type">
                              {item.workType === "1" ? "普通任务" : "计划任务"}
                            </div>
                            <div className="content_sub_type">
                              {DictionaryService.getTitle("draft_type", item.bizType) ||
                                item.bizType}
                            </div>
                          </div>
                          <div className="task_telegram_wrapper">
                            <div className="task_telegram_title">电子报底</div>
                            <div className="task_telegrams">
                              {item.datagrams?.map(datagram => (
                                <div
                                  className="task_telegram_name"
                                  key={`mc-task-telegram-name-${datagram.uuid}`}
                                  onClick={() => setPreTeleUuid(datagram.uuid)}
                                >
                                  {datagram.type === "1" ? "发" : "收"}: {datagram.title}
                                </div>
                              ))}
                              {(!item.datagrams || item.datagrams.length === 0) && ": 无"}
                            </div>
                          </div>
                        </div>
                        <div className="task_right">
                          <div className="task_telegram_wrapper">
                            <div className="task_telegrams">
                              {item.datagrams?.map(datagram => (
                                <div
                                  className="task_telegram_name"
                                  key={`mc-task-telegram-link-${datagram.uuid}`}
                                  onClick={() => setPreTeleUuid(datagram.uuid)}
                                >
                                  {datagram.type === "1" ? "发" : "收"}: {datagram.title}
                                </div>
                              ))}
                            </div>
                          </div>
                          {item.completeFlag === 0 ? (
                            <>
                              {item.type === "2" || (item.type === "1" && item.datagrams) ? (
                                <Button
                                  type="primary"
                                  size="small"
                                  disabled={
                                    item.datagrams === null && item.type === "1" ? true : false
                                  }
                                  onClick={() => {
                                    // setShow(false);
                                    if (getAppType() === "control") {
                                      setCurrTask(item);
                                      setShowExecModal(true);
                                    } else {
                                      onClose && onClose();
                                      if (item.type === "1") {
                                        history.push(
                                          `/cw?mode=${
                                            item.type === "1" ? "tx" : "rx"
                                          }&datagramType=TELS&dir=${
                                            item.datagrams[0]?.uuid
                                          }&taskUuid=${item.id}&contactId=${
                                            item.contactTableId
                                          }&type=${item.bizType}`
                                        );
                                      } else {
                                        history.push(
                                          `/cw?mode=rx&datagramType=TELR&taskUuid=${item.id}&contactId=${item.contactTableId}&type=${item.bizType}`
                                        );
                                      }
                                    }
                                  }}
                                >
                                  立即执行
                                  <SendOutlined rotate={item.type === "1" ? -45 : 135} />
                                </Button>
                              ) : (
                                <Button
                                  type="primary"
                                  size="small"
                                  onClick={() => {
                                    setCurrTask(item);
                                    setTaskModal("edit");
                                  }}
                                >
                                  分配报底
                                  <PlusCircleOutlined />
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              <Button
                                type="primary"
                                onClick={() => {
                                  if (item.type === "1") {
                                    history.push(
                                      `/cw?mode=${
                                        item.type === "1" ? "tx" : "rx"
                                      }&datagramType=TELS&dir=${item.datagrams[0]?.uuid}&taskUuid=${
                                        item.id
                                      }`
                                    );
                                  } else {
                                    history.push(
                                      `/cw?mode=rx&datagramType=TELR&taskUuid=${item.id}`
                                    );
                                  }
                                }}
                              >
                                查看详情
                                <SearchOutlined />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                : null}
            </InfiniteScroll>
          ) : null}
        </div>
        {/* 编辑任务弹窗 */}
        {taskModal !== "hide" && (
          <McTaskModal
            mode={"edit"}
            radioUuid={currTask?.radioUuid}
            currTask={currTask}
            contactTableId={currTask?.contactTableId}
            onCancel={() => {
              setTaskModal("hide");
            }}
            onOk={task => {
              setTaskList(x => ({ ...x, items: [] }));
              // setPages(x => ({ ...x, currentPage: 1 }));
              const idx = taskList.findIndex(x => x.id === task.id);
              if (idx >= 0) {
                taskList[idx] = task;
              }
              setTaskList(taskList);
              setTaskModal("hide");
            }}
          />
        )}
        {/** 执行任务 */}
        {showExecModal && (
          <McTaskExecModal
            currTask={currTask}
            type={currTask?.type}
            telegram={currTask?.datagrams && currTask?.datagrams[0]}
            contactTableId={currTask?.contactTableId}
            onCancel={() => setShowExecModal(false)}
            onOk={() => {
              setShowExecModal(false);
              onClose();
            }}
          />
        )}
        {preTeleUuid && (
          <McTelegramPreview telegramUuid={preTeleUuid} onClose={() => setPreTeleUuid(null)} />
        )}
      </div>
      {goAlert && <AudioFilePlayer fileName="alert2.mp3" />}
    </McModal>
  );
};

export default McTaskRemindList;

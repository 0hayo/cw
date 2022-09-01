import "./index.less";
import React, { FC, useState, useEffect, ReactNode, useCallback } from "react";
import { Button, Radio, Modal } from "antd";
import InfiniteScroll from "react-infinite-scroller";
import McTaskModal from "components/mc-task-model";
import useRemove from "./useRemove";
import useTask from "./useTask";
import {
  RetweetOutlined,
  FileAddOutlined,
  DeleteOutlined,
  FormOutlined,
  SearchOutlined,
  SendOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { MstTheme } from "less/theme";
import { useHistory } from "react-router";
// import McDeviceDropdown from "components/mc-devices-dropdown";
import { getTaskLabelCompleted, setTaskLabelCompleted } from "misc/env";
import moment from "moment";
import DictionaryService from "services/dictionary-service";
import guid from "misc/guid";
import McTelegramPreview from "components/mc-telegram-preview";
import McCommonSelect from "components/mc-common-select";
import ContactTableService from "services/contact-table-service";
import McTaskExecModal from "components/mc-exec-task-modal";
import { getAppType } from "misc/env";
import McIcon from "../mc-icon";
import { logInfo } from "misc/util";
import { Prompt } from "react-router-dom";

interface IProps {
  reload?: boolean;
  radio?: IRadioItem; //传入终端信息
  contactTableId?: number; //指定只显示某个网系的任务列表
  className?: string;
  pageSize?: number;
}

const McTaskList: FC<IProps> = ({
  reload = false,
  radio,
  contactTableId,
  className,
  pageSize = 15,
}) => {
  const history = useHistory();
  const appType = getAppType();

  // 新任务弹窗
  const [taskModal, setTaskModal] = useState<"add" | "edit" | "hide">("hide");
  const [preTeleUuid, setPreTeleUuid] = useState<string>();
  const [currTask, setCurrTask] = useState<ITask>();
  const remove = useRemove();
  // const singleRadio = radioUuid ? true : false; //只显示指定设备的任务列表
  // const singleNet = contactTableId ? true : false; //只显示指定网系的任务列表
  const [showExecModal, setShowExecModal] = useState(false);

  const [keyWord, setKeyWord] = useState<string>("");

  const [currContactId, setCurrContactId] = useState<number>(contactTableId);
  const [contactList, setContactList] = useState<ISysContactTable[]>([]);

  // 获取任务列表
  const [taskList, setTaskList] = useState<ITaskList>(null);
  const [pages, setPages] = useState<IFormPages>({
    currentPage: 1,
    pageSize: pageSize,
    completeFlag: parseInt(getTaskLabelCompleted()), //完成标志
    name: "",
    contactTableId: currContactId,
    orderStr: "start_time asc",
  });

  useTask(setTaskList, pages, reload);

  useEffect(() => {
    setTaskList(null);
  }, [reload]);

  // 加载网系列表
  useEffect(() => {
    ContactTableService.getAllContactTables().then(data => setContactList(data));
  }, []);

  /** 获取网系名称 */
  const getContactName = (contactId: number) => {
    const contactTable = contactList?.find(it => it.id === contactId);
    return contactTable?.contactName || "";
  };

  //切换网系时刷新任务列表
  const handleChangeContact = useCallback(
    (selectedContactId: number) => {
      if (selectedContactId === pages.contactTableId) return;
      setTaskList(x => ({ ...x, items: [] }));
      setPages(x => ({ ...x, contactTableId: selectedContactId, currentPage: 1 }));
    },
    [pages.contactTableId]
  );

  //
  useEffect(() => {
    handleChangeContact(currContactId);
  }, [handleChangeContact, currContactId]);

  //外部传入网系id发生变化时
  useEffect(() => {
    setCurrContactId(contactTableId);
  }, [contactTableId]);

  // 切换任务类型
  const onChangeType = flag => {
    if (flag === pages.completeFlag) return;
    // setTaskLabelCompleted(flag + "");
    setTaskList(x => ({ ...x, items: [] }));
    const orderStr = parseInt(flag) === 0 ? "start_time asc" : "end_time desc";
    setPages(x => ({ ...x, completeFlag: flag, currentPage: 1, orderStr }));
  };
  // 切换排序方式：
  const onChangeSort = value => {
    if (value === pages.orderStr) return;
    setTaskList(x => ({ ...x, items: [] }));
    setPages(x => ({ ...x, orderStr: value, currentPage: 1 }));
  };
  // 下拉加载更多数据
  const handleInfiniteOnLoad = () => setPages(x => ({ ...x, currentPage: pages.currentPage + 1 }));
  const TASK_COMPLETE_STATUS = [
    {
      label: `未完成${
        pages.completeFlag === 0
          ? taskList?.totalNum
            ? "(" + (taskList?.totalNum ? taskList?.totalNum : "") + ")"
            : ""
          : ""
      }`,
      value: 0,
    },
    {
      label: `已完成${
        pages.completeFlag === 1
          ? taskList?.totalNum
            ? "(" + (taskList?.totalNum ? taskList?.totalNum : "") + ")"
            : ""
          : ""
      }`,
      value: 1,
    },
  ];
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
    <div className={`mc-task-list ${className}`}>
      <div className="task_top">
        <div className="task_title">
          任务列表
          <RetweetOutlined
            className="task_icon"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setTaskList(null);
              setPages({
                ...pages,
                currentPage: 1,
                // radioUuid: "",
              });
            }}
          />
        </div>
        <div className="task_top_flex">
          <McCommonSelect
            idPropName="id"
            valuePropName="contactName"
            allowAll={true}
            itemName="网系"
            items={() => {
              return contactList;
            }}
            onChange={(data: ISysContactTable) => {
              console.log("Common select onChange: ", data?.contactName);
              setCurrContactId(data?.id);
            }}
            selectedId={contactTableId + ""}
          />
          <div className="task-search-keyword">
            <input
              type="search"
              value={keyWord}
              className="search-keyword-input"
              placeholder="搜索内容"
              onChange={event => {
                setKeyWord(event.currentTarget.value);
                setTaskList(x => ({ ...x, items: [] }));
                // alert(event.currentTarget.value);
                setPages({ ...pages, name: event.currentTarget.value, currentPage: 1 });
                // onChange({
                //   sortord,
                //   keyword: event.currentTarget.value,
                // });
              }}
            />
            <McIcon className="task-search-icon">search</McIcon>
          </div>
          <div className="task_radio">
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={TASK_COMPLETE_STATUS}
              onChange={e => onChangeType(e.target.value)}
              value={pages.completeFlag}
            />
          </div>
          <div className="task_radio">
            <div className="task_radio_name">排序：</div>
            <Radio.Group onChange={e => onChangeSort(e.target.value)} value={pages.orderStr}>
              <Radio value={pages.completeFlag === 0 ? "start_time asc" : "end_time desc"}>
                时间
              </Radio>
              <Radio value={"name asc"}>名称</Radio>
            </Radio.Group>
          </div>
          {appType === "control" && (
            <div className="task_btns">
              <Button
                type="primary"
                onClick={e => {
                  setCurrTask(undefined);
                  setTaskModal("add");
                }}
              >
                新建任务
                <FileAddOutlined />
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* 任务列表内容区域  */}
      <div className="task_ul">
        {taskList ? (
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={handleInfiniteOnLoad}
            hasMore={Number(taskList.totalPage) > pages.currentPage}
            useWindow={false}
            style={{ height: "100%" }}
          >
            {taskList.items
              ? taskList.items.map(item => {
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
                            {DictionaryService.getTitle("draft_type", item.bizType) || item.bizType}
                          </div>
                        </div>
                        <div className="task_telegram_wrapper">
                          <div className="task_telegram_title">电子报底</div>
                          <div className="task_telegrams">
                            {item.datagrams?.map(datagram => (
                              <div
                                className="task_telegram_name"
                                key={`mc-task-telegram-name-${datagram.uuid}`}
                                onClick={() => {
                                  setPreTeleUuid(datagram.uuid);
                                  setCurrTask(item);
                                }}
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
                                onClick={() => {
                                  setPreTeleUuid(datagram.uuid);
                                  setCurrTask(item);
                                }}
                              >
                                {datagram.type === "1" ? "发" : "收"}: {datagram.title}
                              </div>
                            ))}
                          </div>
                        </div>
                        <DeleteOutlined
                          className="task_icon"
                          onClick={e => {
                            Modal.confirm({
                              centered: true,
                              maskClosable: false,
                              title: "删除任务",
                              content: `您确定要删除任务 ${item.name} 吗？`,
                              onOk: async () => {
                                logInfo("删除任务: " + item.name);
                                await remove(item.id);
                                setTaskList(x => ({ ...x, items: [] }));
                                setPages(x => ({ ...x, currentPage: 1 }));
                              },
                            });
                          }}
                        />
                        {item.completeFlag === 0 ? (
                          <>
                            <FormOutlined
                              className="task_icon"
                              onClick={e => {
                                setCurrTask(item);
                                setTaskModal("edit");
                              }}
                            />
                            {item.type === "2" || (item.type === "1" && item.datagrams) ? (
                              <Button
                                type="primary"
                                size="small"
                                disabled={
                                  item.datagrams === null && item.type === "1" ? true : false
                                }
                                onClick={() => {
                                  let directGo = false;
                                  //如果当前正在查看的终端状态为“已接管”，并且任务网系相符，则直接进入收、发报页面
                                  if (
                                    radio &&
                                    radio.status === 1 &&
                                    radio.contactId === currContactId
                                  ) {
                                    directGo = true;
                                  }

                                  if (appType === "control" && !directGo) {
                                    setCurrTask(item);
                                    setShowExecModal(true);
                                  } else {
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
                                    `/tx/show?mode=${
                                      item.type === "1" ? "tx" : "rx"
                                    }&datagramType=TELS&dir=${
                                      item.datagrams ? item.datagrams[0]?.uuid : ""
                                    }&taskUuid=${item.id}&show=1`
                                  );
                                } else {
                                  history.push(
                                    `/rx/show?mode=rx&datagramType=TELR&dir=${
                                      item.datagrams ? item.datagrams[0]?.uuid : ""
                                    }&taskUuid=${item.id}&show=1&scene=regular&receive=false`
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
      {/* 新建/编辑任务弹窗 */}
      {taskModal !== "hide" && (
        <McTaskModal
          contactTableId={currContactId || currTask?.contactTableId}
          mode={taskModal === "add" ? "add" : "edit"}
          radioUuid={currTask?.radioUuid || pages.radioUuid}
          currTask={currTask}
          onCancel={() => {
            setTaskModal("hide");
          }}
          onOk={() => {
            setTaskList(x => ({ ...x, items: [] }));
            setPages(x => ({ ...x, currentPage: 1 }));
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
          contactTableId={currContactId}
          onCancel={() => setShowExecModal(false)}
        />
      )}
      {preTeleUuid && (
        <McTelegramPreview
          telegramUuid={preTeleUuid}
          types={currTask?.type === "2" && pages.completeFlag === 1 ? "regular" : "code"}
          onClose={() => setPreTeleUuid(null)}
        />
      )}

      <Prompt
        message={() => {
          setTaskLabelCompleted("0");
          return true;
        }}
      />
    </div>
  );
};

export default McTaskList;

import "./index.less";
import React, { FC, useState, useEffect, ReactNode, useCallback, useContext } from "react";
import InfiniteScroll from "react-infinite-scroller";

import { RetweetOutlined } from "@ant-design/icons";
import { MstTheme } from "less/theme";

import moment from "moment";
import guid from "misc/guid";
import McTelegramPreview from "components/mc-telegram-preview";
import MstContext from "containers/mst-context/context";
import useLog from "./useLog";
import { LOCAL_MACHINE_ID } from "misc/env";
import McDeviceDropdown from "components/mc-devices-dropdown";

interface IProps {
  className?: string;
  pageSize?: number;
}

const McLogList: FC<IProps> = ({ className, pageSize = 15 }) => {
  const { appType } = useContext(MstContext);
  const [preTeleUuid, setPreTeleUuid] = useState<string>();
  const [radioUuidNow, setRadioUuidNow] = useState(
    appType === "control" ? undefined : LOCAL_MACHINE_ID
  );

  // 获取任务列表
  const [logList, setLogList] = useState<ILogList>(null);
  const [pages, setPages] = useState<IFormPages>({
    currentPage: 1,
    pageSize: pageSize,
    completeFlag: 0, //完成标志
    radioUuid: radioUuidNow === "" ? null : radioUuidNow,
    orderStr: "created_At desc",
  });

  //切换设备时刷新日志列表
  const handleChangeDevice = useCallback(
    (radioUuidNow: string) => {
      if (radioUuidNow === pages.radioUuid) return;
      setLogList(x => ({ ...x, items: [] }));
      setPages(x => ({
        ...x,
        radioUuid: radioUuidNow === "" ? null : radioUuidNow,
        currentPage: 1,
      }));
    },
    [pages.radioUuid]
  );
  useEffect(() => {
    handleChangeDevice(radioUuidNow);
  }, [handleChangeDevice, radioUuidNow]);

  useLog(setLogList, pages);

  // 下拉加载更多数据
  const handleInfiniteOnLoad = () => setPages(x => ({ ...x, currentPage: pages.currentPage + 1 }));

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
      displayStr = taskDatetime.format("YYYY年M月D日 HH:mm:ss");
    } else if (isToday) {
      displayStr = "今天 " + taskDatetime.format("HH:mm:ss");
      className = className + " task_time_warn";
    } else {
      displayStr = taskDatetime.format("M月D日 HH:mm:ss");
    }
    return <div className={className}>{displayStr}</div>;
  };

  return (
    <div className={`mc-log-list ${className}`}>
      <div className="task_top">
        <div className="task_title">
          日志列表
          <RetweetOutlined
            className="task_icon"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setLogList(null);
              setPages({
                ...pages,
                currentPage: 1,
                // radioUuid: "",
              });
            }}
          />
        </div>
        <div className="task_top_flex">
          {appType === "control" && (
            <div className="statistics_select">
              <McDeviceDropdown
                all={true}
                radioUuid={radioUuidNow}
                onChange={radio => {
                  console.log("on change radio uuid ==", radio?.uuid);
                  setRadioUuidNow(radio?.uuid === "" ? undefined : radio?.uuid);
                }}
              />
            </div>
          )}
        </div>
      </div>
      {/* 日志列表内容区域  */}
      <div className="task_ul">
        {logList ? (
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={handleInfiniteOnLoad}
            hasMore={Number(logList.totalPage) > pages.currentPage}
            useWindow={false}
            style={{ height: "100%" }}
          >
            {logList.items
              ? logList.items.map(item => {
                  return (
                    <div className="task_list" key={`mc-task-list-${guid()}`}>
                      <div className="task_list_left">
                        <div className="task_list_left_name">
                          {item.radioName ? item.radioName : "控制端"}{" "}
                          <span style={{ color: "deepskyblue" }}>{item.account}</span>
                        </div>
                        <div className="task_list_left_dev"></div>
                        {item.id === 0 ? (
                          <div className="task_time_wrapper">
                            时间：{getDisplayTime(item.createdAt, "plan")}
                          </div>
                        ) : (
                          <div className="task_time_wrapper">终端ID:{item.radioUuid}</div>
                        )}
                      </div>
                      <div className="task_list_content">
                        <div className="content_type">
                          <div
                            className="content_sub_type task_time_wrapper"
                            style={{ textAlign: "left", width: "600px" }}
                          >
                            {getDisplayTime(item.createdAt, "finished")}
                          </div>
                          <div
                            className="content_sub_type"
                            style={{
                              textAlign: "left",
                              width: "600px",
                              color:
                                item.type === "1"
                                  ? MstTheme.mc_primary_color
                                  : MstTheme.mc_warning_color,
                            }}
                          >
                            {item.remark}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              : null}
          </InfiniteScroll>
        ) : null}
      </div>
      {/* 新建/编辑任务弹窗 */}
      {/*{taskModal !== "hide" && (*/}
      {/*  <McTaskModal*/}
      {/*    contactTableId={contactId}*/}
      {/*    mode={taskModal === "add" ? "add" : "edit"}*/}
      {/*    radioUuid={currTask?.radioUuid || pages.radioUuid}*/}
      {/*    currTask={currTask}*/}
      {/*    onCancel={() => {*/}
      {/*      setTaskModal("hide");*/}
      {/*    }}*/}
      {/*    onOk={() => {*/}
      {/*      setTaskList(x => ({ ...x, items: [] }));*/}
      {/*      setPages(x => ({ ...x, currentPage: 1 }));*/}
      {/*      setTaskModal("hide");*/}
      {/*    }}*/}
      {/*  />*/}
      {/*)}*/}
      {preTeleUuid && (
        <McTelegramPreview telegramUuid={preTeleUuid} onClose={() => setPreTeleUuid(null)} />
      )}
    </div>
  );
};

export default McLogList;

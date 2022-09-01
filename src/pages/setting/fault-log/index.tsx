import "./index.less";
import React, { FC, useCallback, useEffect, useState } from "react";
import DictionaryService from "services/dictionary-service";
import { getAppType, LOCAL_MACHINE_ID } from "misc/env";
import useAutoHeight from "hooks/useAutoHeight";
import SysCheckLogService from "services/sys-check-log-service";
import { DatePicker, Pagination, Tooltip } from "antd";
import RadioService from "services/radio-service";
import guid from "misc/guid";
import McDeviceDropdown from "components/mc-devices-dropdown";
import McDictDropdown from "components/mc-dictionary-dropdown";
import { ipcRenderer } from "electron";
import { CloseCircleFilled } from "@ant-design/icons";

const McSysFaultLog: FC = () => {
  const appType = getAppType();
  const height = useAutoHeight("fault-body", 176);

  const [logList, setLogList] = useState<IPageResult<ISysCheckLogError>>();
  const [deviceList, setDeviceList] = useState<IRadioItem[]>();
  const [page, setPage] = useState<ISysCheckLogPages>({
    currentPage: 1,
    orderStr: "time desc",
    pageSize: 20,
    radioUuid: null,
    code: null,
  });

  useEffect(() => {
    if (appType === "control") {
      RadioService.getAllRadios().then(data => setDeviceList(data));
      SysCheckLogService.listPage(page).then(data => setLogList(data));
    } else {
      const offset = (page.currentPage - 1) * page.pageSize;
      ipcRenderer.send(
        "queryErrorLog",
        page.code,
        page.startTime,
        page.endTime,
        offset,
        page.pageSize
      );
    }
  }, [appType, page]);

  //监听主进程返回的数据(本地错误日志数据库)
  useEffect(() => {
    if (appType === "control") return;
    const dataListener = (even, total: number, data: any[]) => {
      const listData: ISysCheckLogError[] = [];
      data &&
        data.map(it => {
          const rec: ISysCheckLogError = {
            id: it.id,
            code: it.code,
            radioUuid: LOCAL_MACHINE_ID,
            time: it.time,
          };
          listData.push(rec);
          return it;
        });
      setLogList(x => ({
        ...x,
        items: listData,
        totalNum: total,
      }));
    };

    ipcRenderer.on("queryErrorResult", dataListener);

    return () => {
      ipcRenderer.removeListener("queryErrorResult", dataListener);
    };
  }, [appType]);

  const getDeviceName = useCallback(
    (radioUuid: string) => {
      if (!deviceList) return "";
      const radio = deviceList.find(x => x.uuid === radioUuid);
      return radio ? radio.name : "";
    },
    [deviceList]
  );

  return (
    <div className="fault_body" id="fault-body">
      <div className="dev_header">
        <div className="header_major_tile">
          <div className="title_text">系统故障日志</div>
          {appType === "control" && (
            <div className="search_option">
              <McDeviceDropdown
                all={true}
                onChange={device =>
                  setPage(x => ({ ...x, currentPage: 1, radioUuid: device?.uuid }))
                }
              />
            </div>
          )}
          <div className="search_option">
            <McDictDropdown
              dictType="sys_error_code"
              enableEmpty={true}
              itemDisplay={(title, value) => {
                return <>{value + " - " + title}</>;
              }}
              name="故障类型"
              onChange={dictItem => setPage(x => ({ ...x, currentPage: 1, code: dictItem?.value }))}
            />
          </div>
          <div className="search_option">
            <DatePicker
              placeholder="请选择开始日时间"
              suffixIcon={<CloseCircleFilled />}
              allowClear
              showTime
              onChange={date =>
                setPage({ ...page, currentPage: 1, startTime: date?.format("YYYY-MM-DD HH:mm:ss") })
              }
            />
          </div>
          <div className="search_option">
            <DatePicker
              placeholder="请选择结束日时间"
              suffixIcon={<CloseCircleFilled />}
              allowClear
              showTime
              onChange={date =>
                setPage({ ...page, currentPage: 1, endTime: date?.format("YYYY-MM-DD HH:mm:ss") })
              }
            />
          </div>
        </div>
        <div className="header_sub_tile">
          <div className="sub_item_title" style={{ width: "120px" }}>
            序号
          </div>
          {appType === "control" && (
            <div className="sub_item_title" style={{ width: "240px" }}>
              终端名称
            </div>
          )}
          <div className="sub_item_title" style={{ width: "240px" }}>
            发生时间
          </div>
          <div className="sub_item_title" style={{ width: "120px" }}>
            故障编号
          </div>
          <div className="sub_item_title" style={{ width: "240px" }}>
            故障描述
          </div>
          <div className="sub_item_title" style={{ flexGrow: 3 }}>
            处理建议
          </div>
        </div>
      </div>
      {/* client */}
      <div className="item_scroll" style={{ height: height }}>
        {logList?.items &&
          logList.items.map(item => (
            <div className="client_style" key={guid()}>
              <div className="sub_item_fix" style={{ width: 120 }}>
                {item.id}
              </div>
              {appType === "control" && (
                <div className="sub_item_fix" style={{ width: "240px", alignItems: "flex-start" }}>
                  {getDeviceName(item.radioUuid)}
                </div>
              )}
              <div className="sub_item_fix sub_item_time" style={{ width: "240px" }}>
                {item.time}
              </div>
              <div className="sub_item_fix" style={{ width: "120px" }}>
                {item.code}
              </div>
              <div className="sub_item_fix" style={{ width: 240 }}>
                {DictionaryService.getTitle("sys_error_code", item.code)}
              </div>
              <div className="solutions">
                {(() => {
                  const desc = DictionaryService.getDesc("sys_error_code", item.code);
                  const obj = desc ? JSON.parse(desc) : [];
                  const tip = (
                    <div className="solution-wrapper">{obj && obj.map(it => <div>{it}</div>)}</div>
                  );
                  try {
                    return <Tooltip title={tip}>{obj.join(" | ")}</Tooltip>;
                  } catch (e) {
                    return <Tooltip title={desc}>{desc}</Tooltip>;
                  }
                })()}
              </div>
            </div>
          ))}
      </div>
      <div className="fault-log-pagination">
        <Pagination
          pageSize={page.pageSize}
          current={page.currentPage}
          total={logList?.totalNum}
          showQuickJumper={false}
          showTotal={total => `共 ${total} 条记录 `}
          onChange={(page, size) => {
            setPage(x => ({ ...x, currentPage: page }));
          }}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default McSysFaultLog;

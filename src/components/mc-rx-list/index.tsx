import "./index.less";
import React, { FC, useState } from "react";
// import Assign from "images/base/assign.png";
// import InfiniteScroll from "react-infinite-scroller";
import useRemove from "./useRemove";
import useData from "./useData";
import { Modal, Tooltip } from "antd";
import { useHistory } from "react-router";
import { IFormRxPages } from "./types";
import McTelegramPreview from "components/mc-telegram-preview";
import { logInfo } from "misc/util";
import moment from "moment";
import { MstTheme } from "less/theme";
import guid from "misc/guid";
import { SearchOutlined, DeleteOutlined, PrinterOutlined } from "@ant-design/icons";
import McIcon from "components/mc-icon";

// 已收报文列表
const McRxList: FC = () => {
  // 待发报文请求参数
  const [pages, setPages] = useState<IFormRxPages>({
    currentPage: 1,
    pageSize: 8,
    type: "2",
    status: 0,
    orderStr: "created_at desc",
  });
  // 定义 待发报文
  const [telegram, setTelegram] = useState<IPageResult<McTelegramMeta>>(null);
  const [reload, setReload] = useState<boolean>(false);
  const [preTeleUuid, setPreTeleUuid] = useState<string>();

  const remove = useRemove();
  useData(telegram, pages, setTelegram, reload);

  // 加载更多数据
  // const handleInfiniteOnLoad = () => setPages(x => ({ ...x, currentPage: pages.currentPage + 1 }));

  const history = useHistory();

  return (
    <div className="mc-rx-list">
      {telegram &&
        telegram.items &&
        telegram.items.map(item => (
          <div className="list_item" key={guid()}>
            <div className="list_left">
              <div className="list_left_title" title={item.name}>
                {item.name}
              </div>
            </div>
            <div className="list_date">
              接收时间：{moment(item.stime).format("yyyy-MM-DD HH:mm:ss")}
            </div>
            <div className="list_right">
              <div
                className="rx-check-status"
                style={{
                  color:
                    item.state === "check" ? MstTheme.mc_green_color : MstTheme.mc_danger_color,
                }}
              >
                {item.state === "check" ? "已校报" : "未校报"}
              </div>
              <Tooltip title="快速预览">
                <div className="task_icon" onClick={() => setPreTeleUuid(item.datagramUuid)}>
                  <SearchOutlined />
                </div>
              </Tooltip>
              <Tooltip title="删除报文">
                <div
                  className="task_icon"
                  onClick={e => {
                    Modal.confirm({
                      centered: true,
                      maskClosable: true,
                      content: "您确定要删除吗？",
                      title: "删除报文",
                      onOk: () => {
                        logInfo("删除报文: " + item.name);
                        remove(item.taskId);
                        // setTelegram(x => ({ ...x, items: [] }));
                        setTimeout(() => {
                          setPages(x => ({ ...x, currentPage: 1 }));
                          setReload(true);
                        }, 200);
                      },
                    });
                  }}
                >
                  <DeleteOutlined />
                </div>
              </Tooltip>
              {item.state !== "check" ? (
                <Tooltip title="整报校报">
                  <div
                    className="task_icon"
                    onClick={() => {
                      //  alert("1")
                      const url = `/rx?dir=${encodeURIComponent(
                        item.datagramUuid
                      )}&from=${encodeURIComponent(
                        item.datagramUuid
                      )}&scene=regular&receive=false&taskUuid=${encodeURIComponent(
                        item.taskId
                      )}&retpath=home&fromFile=true`;
                      history.push(url);
                    }}
                  >
                    <McIcon>check</McIcon>
                  </div>
                </Tooltip>
              ) : (
                <Tooltip title="打印报文">
                  <div
                    className="task_icon"
                    onClick={() => {
                      history.push(
                        `/rx/show?mode=rx&datagramType=TELR&type=${
                          item.type
                        }&datagramDraftUuid=${encodeURIComponent(
                          item.datagramUuid
                        )}&dir=${encodeURIComponent(
                          item.datagramUuid
                        )}&taskUuid=${encodeURIComponent(
                          item.taskId
                        )}&scene=regular&receive=false&print=true&retpath=home&filetype=recv`
                      );
                    }}
                  >
                    <PrinterOutlined />
                  </div>
                </Tooltip>
              )}
              {/* <Tooltip title="立即发送">
                <div
                  className="task_icon"
                  onClick={() => {
                    setCurrTelegram(item);
                    hideFun();
                    if (getAppType() === "control" && !directGo) {
                      setShowExecModal(true);
                    } else {
                      history.push(`/cw?dir=${item.uuid}&mode=tx`);
                    }
                  }}
                >
                  发送
                </div>
              </Tooltip> */}
            </div>
          </div>
        ))}
      {/* 报文预览 */}
      {preTeleUuid && (
        <McTelegramPreview telegramUuid={preTeleUuid} onClose={() => setPreTeleUuid(null)} />
      )}
    </div>
  );
};
export default McRxList;

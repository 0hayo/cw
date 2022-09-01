import "./index.less";
import React, { FC, useState } from "react";
// import Assign from "images/base/assign.png";
// import InfiniteScroll from "react-infinite-scroller";
import useRemove from "./useRemove";
import useData from "./useData";
import { Modal, Tooltip } from "antd";
import { useHistory } from "react-router";
import { IFormSentPages } from "./types";
import McTelegramPreview from "components/mc-telegram-preview";
import { logInfo } from "misc/util";
import moment from "moment";
import guid from "misc/guid";
import { SearchOutlined, DeleteOutlined, OrderedListOutlined } from "@ant-design/icons";

// 已发报文列表
const McSentList: FC = () => {
  // 待发报文请求参数
  const [pages, setPages] = useState<IFormSentPages>({
    currentPage: 1,
    pageSize: 8,
    type: "1",
    status: 0,
    orderStr: "updated_at desc",
  });
  // 定义 已发报文列表
  const [telegram, setTelegram] = useState<IPageResult<McTelegramMeta>>(null);
  const [reload, setReload] = useState<boolean>(false);
  const [preTeleUuid, setPreTeleUuid] = useState<string>();

  const remove = useRemove();
  useData(telegram, pages, setTelegram, reload);

  // 加载更多数据
  // const handleInfiniteOnLoad = () => setPages(x => ({ ...x, currentPage: pages.currentPage + 1 }));

  const history = useHistory();

  return (
    <div className="mc-sent-list">
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
              完成时间：{moment(item.stime).format("yyyy-MM-DD HH:mm:ss")}
            </div>
            <div className="list_right">
              <Tooltip title="快速预览">
                <div className="task_icon" onClick={() => setPreTeleUuid(item.datagramUuid)}>
                  <SearchOutlined />
                </div>
              </Tooltip>
              <Tooltip title="删除已发报文">
                <div
                  className="task_icon"
                  onClick={e => {
                    Modal.confirm({
                      centered: true,
                      maskClosable: true,
                      content: "您确定要删除已发报文吗？",
                      title: "删除已发报文",
                      onOk: () => {
                        logInfo("删除已发报文: " + item.name);
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
              <Tooltip title="查看已发报文">
                <div
                  className="task_icon"
                  onClick={() => {
                    history.push(
                      `/tx/show?mode=tx&datagramType=TELS&type=${
                        item.type
                      }&datagramDraftUuid=${encodeURIComponent(
                        item.datagramUuid
                      )}&dir=${encodeURIComponent(
                        item.datagramUuid
                      )}&scene=regular&receive=false&retpath=home&taskUuid=${encodeURIComponent(
                        item.taskId
                      )}&filetype=send`
                    );
                  }}
                >
                  <OrderedListOutlined />
                </div>
              </Tooltip>
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
export default McSentList;

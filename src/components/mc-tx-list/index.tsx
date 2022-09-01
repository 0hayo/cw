import "./index.less";
import React, { FC, useState } from "react";
// import Assign from "images/base/assign.png";
import InfiniteScroll from "react-infinite-scroller";
import useRemove from "./useRemove";
import useData from "./useData";
import { Modal, Tooltip } from "antd";
import { useHistory } from "react-router";
import { IFormTxPages } from "./types";
import McTelegramPreview from "components/mc-telegram-preview";
import { logInfo } from "misc/util";
import { DeleteOutlined, EditOutlined, SendOutlined } from "@ant-design/icons";

interface IProps {
  pageSize: number;
}

// 待发报文组件
const McTxList: FC<IProps> = ({ pageSize = 10 }) => {
  const history = useHistory();
  // 待发报文请求参数
  const [pages, setPages] = useState<IFormTxPages>({
    currentPage: 1,
    pageSize: pageSize,
    type: 1,
    status: 0,
    orderStr: "updated_at desc",
  });
  // 定义 待发报文
  const [telegram, setTelegram] = useState<IPageResult<ITelegram>>(null);
  const [reload, setReload] = useState<boolean>(false);
  const [preTeleUuid, setPreTeleUuid] = useState<string>();

  const remove = useRemove();
  useData(telegram, pages, setTelegram, reload);

  // 加载更多数据
  const handleInfiniteOnLoad = () => setPages(x => ({ ...x, currentPage: pages.currentPage + 1 }));

  return (
    <div className="mc-tx-list">
      {telegram && telegram.items ? (
        <InfiniteScroll
          initialLoad={false}
          pageStart={0}
          loadMore={handleInfiniteOnLoad}
          hasMore={Number(telegram.totalPage) > pages.currentPage}
          useWindow={false}
          style={{ height: "100%" }}
        >
          {telegram.items.map(item => {
            return (
              <div className="list_item" key={item.uuid}>
                <div className="list_left">
                  <div
                    className="list_left_title"
                    title={item.title}
                    onClick={() => setPreTeleUuid(item.uuid)}
                  >
                    {item.title}
                  </div>
                </div>
                <div className="list_date">更新时间：{item.updatedAt}</div>
                <div className="list_right">
                  <Tooltip title="编辑报文">
                    <div
                      className="task_icon"
                      onClick={() => {
                        //  alert("1")
                        history.push(`/telegram/input?from=${encodeURIComponent(item.uuid)}`);
                      }}
                    >
                      <EditOutlined />
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
                            logInfo("删除报文: " + item.title);
                            remove(item.uuid);
                            setTelegram(x => ({ ...x, items: [] }));
                            setPages(x => ({ ...x, currentPage: 1 }));
                            // setTelegram(x => ({ ...x, items: [] }));
                            // setPages(x => ({ ...x, currentPage: 1 }));
                            setReload(true);
                            // history.push("/telegram");
                          },
                        });
                      }}
                    >
                      <DeleteOutlined />
                    </div>
                  </Tooltip>
                  <Tooltip title="立即发送">
                    <div
                      className="task_icon"
                      onClick={() => {
                        history.push(`/cw?dir=${item.uuid}&mode=tx`);
                      }}
                    >
                      <SendOutlined rotate={-45} />
                    </div>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </InfiniteScroll>
      ) : null}

      {preTeleUuid && (
        <McTelegramPreview telegramUuid={preTeleUuid} onClose={() => setPreTeleUuid(null)} />
      )}
    </div>
  );
};
export default McTxList;

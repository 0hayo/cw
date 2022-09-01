import "./index.less";
import React, { FC, useState, useEffect } from "react";
import { Button } from "antd";
import { UserDeleteOutlined, CheckOutlined } from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroller";
import fetch from "utils/fetch";
import { IPropsTelegram, ITelegramModal } from "pages/telegram/form";
import useMounted from "hooks/useMounted";
import McTelegramPreview from "components/mc-telegram-preview";
import McModalNice from "components/mc-modal-nice";

const McTelegramModal: FC<ITelegramModal> = ({ visible, onCancel, onOk }) => {
  // 待发报文请求参数
  const [pages, setPages] = useState({
    currentPage: 1,
    pageSize: 15,
    type: 1,
    status: 0,
  });
  const [telegram, setTelegram] = useState<IPropsTelegram>(null);
  const [preTeleUuid, setPreTeleUuid] = useState<string>();
  const mounted = useMounted();

  // 获取 待发报文 请求
  useEffect(() => {
    const wait = fetch.post<ManageResponse>("/sysDatagram/listPage", JSON.stringify(pages));
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (mounted.current && result.status === 1) {
        setTelegram(x => ({
          ...x,
          totalPage: result.data.totalPage,
          items: !telegram ? result.data.items : [...telegram.items, ...result.data.items],
        }));
      }
    });
    // eslint-disable-next-line
  }, [pages, setTelegram]);

  const handleInfiniteOnLoad = () => setPages(x => ({ ...x, currentPage: pages.currentPage + 1 }));
  return (
    <McModalNice
      centered
      className="mc_telegram_modal"
      visible={visible}
      closable={false}
      footer={null}
      onCancel={onCancel}
    >
      <div className="modal_head">
        <UserDeleteOutlined className="head_icon" />
        {/* 选择电子报底*/}
        选择电子报底
      </div>
      <div className="modal_ul">
        {telegram && (
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={handleInfiniteOnLoad}
            hasMore={Number(telegram.totalPage) > pages.currentPage}
            useWindow={false}
          >
            {telegram.items.map(item => {
              return (
                <div className="telegram_list" key={item.uuid}>
                  <div className="telegram_list_left">
                    <div className="list_title" onClick={() => setPreTeleUuid(item.uuid)}>
                      {item.title}
                    </div>
                    <div className="list_time">创建时间: {item.createdAt}</div>
                  </div>
                  <div className="telegram_list_right">
                    <Button
                      type="primary"
                      onClick={e => onOk(item.title, item.uuid, item.radioUuid)}
                    >
                      确定 <CheckOutlined />
                    </Button>
                  </div>
                </div>
              );
            })}
          </InfiniteScroll>
        )}
      </div>
      {preTeleUuid && (
        <McTelegramPreview telegramUuid={preTeleUuid} onClose={() => setPreTeleUuid(null)} />
      )}
    </McModalNice>
  );
};

export default McTelegramModal;

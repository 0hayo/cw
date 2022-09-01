import "./telegramListModal.less";
import React, { FC } from "react";
import McTelegramList from "components/mc-telegram-list";
import McModalNice from "components/mc-modal-nice/index";

interface IProps {
  visible: boolean;
  onCancel?: VoidFunction;
  hideFun?: VoidFunction;
}

const TelegramListModal: FC<IProps> = ({ visible, onCancel, hideFun }) => {
  return (
    <McModalNice
      okText="发送"
      title="选择报文"
      footer={null}
      visible={visible}
      className="mc_telegram_list_modal"
      maskClosable={false}
      centered={true}
      onCancel={onCancel}
    >
      <McTelegramList onChange={() => {}} directGo={true} hideFun={hideFun} />
    </McModalNice>
  );
};

export default TelegramListModal;

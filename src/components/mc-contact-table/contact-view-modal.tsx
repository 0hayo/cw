import React, { FC } from "react";
import McModalNice from "components/mc-modal-nice";
import ContactTableSetting from ".";

interface IProps {
  contactId: string;
  contactName: string;
  onClose: () => void;
}

const McContactViewModal: FC<IProps> = ({ contactId, contactName, onClose }) => {
  return (
    <McModalNice
      title={`查看联络文件: ${contactName}`}
      width={880}
      onCancel={onClose}
      centered
      visible
    >
      <ContactTableSetting contactId={contactId} readonly />
    </McModalNice>
  );
};

export default McContactViewModal;

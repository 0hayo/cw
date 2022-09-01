import "./index.less";
import React, { FC } from "react";
import classnames from "classnames";
import { Modal } from "antd";
import Icon from "components/mc-icon";
import { ModalProps } from "antd/es/modal/Modal";

const McModal: FC<ModalProps> = ({ className, ...rest }) => {
  return (
    <Modal
      closeIcon={<Icon size="16">close</Icon>}
      className={classnames("mc-modal", className)}
      {...rest}
    />
  );
};

export default McModal;

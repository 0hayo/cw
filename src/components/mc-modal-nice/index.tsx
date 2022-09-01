import "./index.less";
import React, { FC, ReactNode } from "react";
import classnames from "classnames";
import { Modal } from "antd";
import Icon from "components/mc-icon";
import { ModalProps } from "antd/es/modal/Modal";

interface IProps extends ModalProps {
  icon?: ReactNode | string;
}

const McModalNice: FC<IProps> = ({ icon, className, title, children, footer, ...rest }) => {
  return (
    <Modal
      closeIcon={<Icon size="16">close</Icon>}
      className={classnames("mc-modal-nice", className)}
      footer={null}
      maskTransitionName=""
      transitionName=""
      {...rest}
    >
      <div className="modal_head">
        <div className="head_icon">{icon}</div>
        <div className="head_title">{title}</div>
      </div>
      <div className="modal_content">{children}</div>
      {footer && <div className="modal_footer">{footer}</div>}
    </Modal>
  );
};

export default McModalNice;

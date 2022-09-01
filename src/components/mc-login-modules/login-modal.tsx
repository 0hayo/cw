import "./login-modal.less";
import React, { FC, useState } from "react";
import McModal from "components/mc-modal";
import McLoginBox from "./login-box";
import useMounted from "hooks/useMounted";
import message from "misc/message";
import { useDispatch } from "react-redux";
import { logout } from "store/actions/auth";

const McLoginModal: FC = () => {
  const mounted = useMounted();
  const [show, setShow] = useState(true);
  const dispatch = useDispatch();

  return (
    <McModal
      className="mc-login-modal"
      title="请重新登录"
      closable={true}
      maskClosable={false}
      visible={show}
      footer={false}
      centered={true}
      width={320}
      onCancel={() => {
        dispatch(logout());
        window.location.reload();
      }}
    >
      {mounted.current && (
        <McLoginBox
          onError={(code, msg) => {
            message.destroy();
            message.failure("登录失败", msg);
            dispatch(logout());
            window.location.reload();
          }}
          onSuccess={msg => {
            message.destroy();
            message.success(msg);
            window.location.reload();
            setShow(false);
          }}
        />
      )}
    </McModal>
  );
};

export default McLoginModal;

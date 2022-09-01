import "./index.less";
import React, { FC } from "react";
import McButton from "components/mc-button";
import { useDispatch } from "react-redux";
import { logout } from "store/actions/auth";
import message from "misc/message";
import fetch from "utils/fetch";
import { LOCAL_MACHINE_ID as radioUuid } from "misc/env";

const McLogoutButtons: FC = () => {
  const dispatch = useDispatch();
  return (
    <div className="mc-logout-buttons">
      <McButton type="primary" warning onClick={() => message.destroy()}>
        取消
      </McButton>
      <McButton
        type="primary"
        icon="exit"
        onClick={() => {
          fetch.post(`/user/logout?radioUuid=${radioUuid}`).then(() => {
            dispatch(logout());
            window.location.reload();
          });
        }}
      >
        重新登录
      </McButton>
    </div>
  );
};

export default McLogoutButtons;

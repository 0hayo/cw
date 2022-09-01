//  语音button 组件
import "./index.less";
import React, { FC } from "react";
import { Avatar } from "antd";
import UserOutlined from "@ant-design/icons/lib/icons/UserOutlined";

interface IProps {
  user?: IUser; //账号
}

const UserCard: FC<IProps> = ({ user }) => {
  return (
    <div className="content_device_list_detail">
      <div className="detail_img">
        <Avatar
          shape="square"
          style={{ borderRadius: 4 }}
          size={42}
          // src={<img src="/avatar/admin.png" alt="头像" />}
          icon={<UserOutlined style={{ fontSize: 32 }} />}
        />
      </div>
      <div className="detail_left">
        <div className="detail_name">{user.account}</div>
        <div className="detail_text">{user.userName}</div>
      </div>
      <div className="detail_right">
        <div className="detail_text">
          {user.roles
            ?.sort((a, b) => (a.id > b.id ? 1 : -1))
            .map((it, idx) => it.name + (idx === user.roles?.length - 1 ? "" : " / "))}
        </div>
      </div>
    </div>
  );
};
export default UserCard;

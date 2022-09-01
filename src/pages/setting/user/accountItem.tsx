import React, { FC, useState } from "react";
import { ExportOutlined, SaveOutlined } from "@ant-design/icons";
import { Checkbox, Input, Modal } from "antd";
import headImg from "images/base/Img.png";
import McButton from "components/mc-button";
// import { logInfo } from "../../../misc/util";
//import versions
import versionControlCenter from "misc/version-control.json";
import versionTerminal from "misc/version-terminal.json";
import versionSingle from "misc/version-single.json";
import { getAppType } from "misc/env";
interface ItemProps {
  type: "edit" | "add";
  user: IUser;
  onSave: (user, type: "edit" | "add") => void;
  onBack?: () => void;
}

const AccountItem: FC<ItemProps> = ({ type, user, onSave, onBack }) => {
  const appType = getAppType();
  const version =
    appType === "control"
      ? versionControlCenter
      : appType === "terminal"
      ? versionTerminal
      : versionSingle;
  const [userData, setUserData] = useState<IUser>(user);
  // const [account, setAccount] = useState("");
  // const [name, setName] = useState("");
  // const [code, setCode] = useState("");
  // const [pass, setPass] = useState("");
  const [changePwd, setChangePwd] = useState(false);

  // // 获取账号详情
  // useEffect(() => {
  //   if (!user.uuid) return;
  //   const wait = fetch.get<ManageResponse>(`/sysUserAccount/get/${user.uuid}`);
  //   Promise.resolve(wait).then(response => {
  //     const result = response.data;
  //     if (result.status === 1) {
  //      set
  //     } else message.failure(result.message);
  //   });
  //   // eslint-disable-next-line
  // }, [user.uuid, setAccount, setName, setCode, setPass]);

  // useEffect(() => {
  //   const ref = inputRef.current;
  //   console.log(ref);
  //   if (ref) ref.focus();
  // }, [change]);

  console.log("user roles===", userData.roles);

  return (
    <div className="controller_content">
      <div className="controller_content_head">
        <img src={headImg} alt="" />
      </div>
      {/* from 表单修改 */}
      <div className="controller_content_from">
        <div className="content_from_list">
          <div className="content_from_name">用户名:</div>
          <div className="content_from_flex">
            <Input
              className={`content_from_text ${type === "add" ? "bgc_input" : null}`}
              type="text"
              value={userData?.account}
              onChange={e => {
                if (e.currentTarget.value === "2020666") {
                  Modal.info({
                    centered: true,
                    title: "版本信息",
                    content: (
                      <div className="version-info">
                        <div className="version-item">
                          <div className="version-name">{version.versionName}</div>
                        </div>
                        <div className="version-item">
                          <div className="version-title">版本号:</div>
                          <div className="version-content">{version.versionNo}</div>
                        </div>
                        <div className="version-item">
                          <div className="version-title">客户:</div>
                          <div className="version-content">{version.clientDesc}</div>
                        </div>
                        <div className="version-item">
                          <div className="version-title">发布日期:</div>
                          <div className="version-content">{version.publishDate}</div>
                        </div>
                        <div className="version-item">
                          <div className="version-title">更新说明:</div>
                          <div className="version-content">{version.updateDesc}</div>
                        </div>
                      </div>
                    ),
                  });
                }
                setUserData({ ...userData, account: e.currentTarget.value });
              }}
            />
          </div>
        </div>
        <div className="content_from_list">
          <div className="content_from_name">姓名:</div>
          <div className="content_from_flex">
            <Input
              className={`content_from_text ${type === "add" ? "bgc_input" : null}`}
              type="text"
              value={userData?.userName}
              onChange={e => setUserData({ ...userData, userName: e.currentTarget.value })}
            />
          </div>
        </div>
        <div className="content_from_list">
          <div className="content_from_name">工号:</div>
          <div className="content_from_flex">
            <Input
              className={`content_from_text ${type === "add" ? "bgc_input" : null}`}
              type="text"
              value={userData?.empno}
              onChange={e => setUserData({ ...userData, empno: e.currentTarget.value })}
            />
          </div>
        </div>
        <div className="content_from_list">
          <div className="content_from_name">证件号:</div>
          <div className="content_from_flex">
            <Input
              className={`content_from_text ${type === "add" ? "bgc_input" : null}`}
              type="text"
              value={userData?.idNumber}
              onChange={e => setUserData({ ...userData, idNumber: e.currentTarget.value })}
            />
          </div>
        </div>
        <div className="content_from_list">
          <div className="content_from_name">角色:</div>
          <div className="content_from_flex">
            {userData.roles?.findIndex(x => x.role === "superadmin") >= 0 ? (
              <Checkbox checked disabled>
                超级管理员
              </Checkbox>
            ) : (
              <Checkbox
                defaultChecked={
                  userData.roles?.findIndex(x => x.role === "admin") >= 0 ? true : false
                }
                onChange={e => {
                  console.log("change user admin role:", e.target);
                  if (!e.target.checked) {
                    setUserData({
                      ...userData,
                      roles: userData.roles?.filter(x => x.role !== "admin"),
                    });
                  } else {
                    setUserData({
                      ...userData,
                      roles: [...userData.roles, { id: 2, role: "admin", name: "管理员" }],
                    });
                  }
                }}
              >
                管理员
              </Checkbox>
            )}
          </div>
        </div>
        {(type === "add" || changePwd) && (
          <>
            <div className="content_from_list">
              <div className="content_from_name">密码:</div>
              <div className="content_from_flex">
                <Input
                  className={`content_from_text ${type === "add" ? "bgc_input" : null}`}
                  type="password"
                  value={userData.password}
                  onChange={e => setUserData({ ...userData, password: e.currentTarget.value })}
                />
              </div>
            </div>
            <div className="content_from_list">
              <div className="content_from_name">重复密码:</div>
              <div className="content_from_flex">
                <Input
                  className={`content_from_text ${type === "add" ? "bgc_input" : null}`}
                  type="password"
                  value={userData.rePassword}
                  onChange={e => setUserData({ ...userData, rePassword: e.currentTarget.value })}
                />
              </div>
            </div>
          </>
        )}
        <div className="content_from_list">
          <div className="content_from_flex">
            {type !== "add" && (
              <Checkbox checked={changePwd} onClick={() => setChangePwd(!changePwd)}>
                修改密码
              </Checkbox>
            )}
          </div>
        </div>
      </div>
      <div className="content_btm">
        <McButton type="primary" warning onClick={e => onBack()}>
          取消 <ExportOutlined />
        </McButton>
        <McButton
          type="primary"
          onClick={e => {
            // logInfo("保存用户");
            onSave(userData, type);
          }}
        >
          保存 <SaveOutlined />
        </McButton>
      </div>
    </div>
  );
};

export default AccountItem;

import "./index.less";
import React, { FC, useState } from "react";
import { Button, Modal } from "antd";
import UserCard from "./user-card";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import GroupItem from "./groupItem";
import AccountItem from "./accountItem";
import useUserAccount from "./useUserAccount";
import useGroupList from "./useGroupList";
import useGroup from "./useGroup";
import useAccountList from "./useAccountList";
import { logInfo } from "../../../misc/util";

interface IFrom {
  add: boolean;
  type: "edit" | "add";
  id: string;
}

// 终端用户管理
const UserManagement: FC = () => {
  // 初始请求参数
  const [pages] = useState<IFormPages>({
    currentPage: 1,
    pageSize: 100,
    orderStr: "created_at asc",
  });

  // 分组列表
  const [groupList, setGroupList] = useState<IGroup[]>(null);
  const [addGroup, setAddGroup] = useState(false);
  // const [groupName, setGroupName] = useState<string>(null);
  const [currGroup, setCurrGroup] = useState<IGroup>();
  const [form, setForm] = useState<IFrom>({ add: false, type: "edit", id: null });
  const { save: saveGroup, remove: removeGroup } = useGroup(); // 保存 or 更新 班组
  useGroupList(pages, setGroupList, addGroup, setCurrGroup); // 获取班组列表 数据

  const [accountList, setAccountList] = useState<IUser[]>(null);
  const [currUserAccount, setCurrUserAccount] = useState<IUser>();
  const { save, remove } = useUserAccount(); // 保存 or 更新 账号
  useAccountList(pages, setAccountList, form, currGroup?.groupName); // 获取账号列表 数据

  const EMPTY_USER: IUser = {
    userName: "",
    account: "",
    roles: [{ id: 3, role: "telegrapher", name: "报务员" }],
    groupName: currGroup?.groupName,
    groupId: currGroup?.id + "",
  };

  return (
    <div className="user_content">
      {/* 选择控制台列表 */}
      <div className="controller">
        <div className="controller_ul">
          {
            // 遍历 班组列表
            groupList &&
              groupList.map(item => {
                return (
                  <GroupItem
                    key={item.id}
                    id={item.id}
                    text={item.groupName}
                    mode="edit"
                    active={currGroup?.groupName}
                    onActive={id => setCurrGroup(groupList.find(x => x.id + "" === id))}
                    onSave={(content, id) => saveGroup(content, id)}
                    onDrop={id => {
                      removeGroup(id);
                      setGroupList(groupList.filter(x => x.id !== id));
                      setCurrGroup(groupList[0]);
                      setAddGroup(false);
                    }}
                  ></GroupItem>
                );
              })
          }
          {
            // 新增input
            addGroup && (
              <GroupItem
                id={null}
                text={""}
                mode={"new"}
                onSave={(content, id) => {
                  saveGroup(content, id);
                }}
                onDrop={e => {
                  setAddGroup(false);
                }}
              ></GroupItem>
            )
          }
          {/* 添加班组 */}
          <div className="controller_list">
            <div className="controller_list_left active add" onClick={e => setAddGroup(true)}>
              <PlusOutlined />
            </div>
          </div>
        </div>

        {/* 展示用户信息列表 */}
        {form.add ? (
          <AccountItem
            type={form.type}
            user={form.type === "add" ? EMPTY_USER : { ...currUserAccount, password: "" }}
            onSave={async (user, type) => {
              const success = await save(type, user);
              if (success) {
                setForm(x => ({ ...x, add: false }));
              }
            }}
            onBack={() => {
              setForm(x => ({ ...x, add: false }));
            }}
          ></AccountItem>
        ) : (
          // 用户信息列表
          <div className="controller_content">
            <div className="account_ul">
              {accountList &&
                accountList.map(item => {
                  return (
                    <div className="controller_content_list" key={item.uuid}>
                      <UserCard user={item}></UserCard>
                      <div className="set_user">
                        <div
                          className="set_user_text"
                          onClick={e => {
                            setCurrUserAccount(item);
                            setForm({ add: true, type: "edit", id: item.uuid });
                          }}
                        >
                          修改用户信息
                        </div>
                        <div
                          className="set_user_text"
                          onClick={() => {
                            Modal.confirm({
                              centered: true,
                              maskClosable: false,
                              content: "您确定要删除吗？",
                              onOk: () => {
                                logInfo("删除成功。");
                                remove(item.uuid);
                                setForm(x => ({ ...x }));
                              },
                            });
                          }}
                        >
                          删除用户
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="controller_add">
              <Button
                type="primary"
                onClick={e => setForm(x => ({ add: true, type: "add", id: null }))}
              >
                新增用户
                <UserOutlined />
              </Button>
            </div>
          </div>
        )}
        {/* 修改个人用户信息 */}
      </div>
    </div>
  );
};

export default UserManagement;

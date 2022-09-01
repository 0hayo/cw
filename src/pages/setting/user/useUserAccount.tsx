import message from "misc/message";
import { useCallback } from "react";
import fetch from "utils/fetch";
import guid from "misc/guid";
import { logInfo } from "misc/util";
// 用户保存

const useUserAccount = (): {
  save: (type: "edit" | "add", user: IUser) => Promise<boolean>;
  remove: (id: string) => void;
} => {
  const save = useCallback(async (type: "edit" | "add", user: IUser): Promise<boolean> => {
    try {
      if (!user.account || user.account.trim() === "") {
        message.failure("请输入用户名");
        return false;
      }
      if (!user.userName || user.userName.trim() === "") {
        message.failure("请输入姓名");
        return false;
      }
      if (!user.idNumber || user.idNumber.trim() === "") {
        message.failure("请输入证件号");
        return false;
      }
      if (!user.empno || user.empno.trim() === "") {
        message.failure("请输入工号");
        return false;
      }
      if (!user.groupId) {
        message.failure("请选择用户班组");
        return false;
      }
      // 通过id 判断 是更新账号 or 新增账号
      let data = {
        account: user.account,
        userName: user.userName,
        idNumber: user.idNumber,
        empno: user.empno,
        groupName: user.groupName,
        groupId: user.groupId,
        uuid: "",
        password: "",
        rePassword: "",
        roles: user.roles,
      };
      data.uuid = type === "edit" ? user.uuid : guid();
      if (user.password) {
        if (user.password.length < 6 || user.password.length > 12) {
          message.failure("密码长度应在6~12位之内");
          return false;
        }
        if (user.password !== user.rePassword) {
          message.failure("两次密码输入不一致");
          return false;
        }
        data.password = user.password;
        data.rePassword = user.rePassword;
      }
      const response =
        type === "edit"
          ? await fetch.put<ManageResponse>("/sysUserAccount/update", JSON.stringify(data))
          : await fetch.post<ManageResponse>("/sysUserAccount/insert", JSON.stringify(data));
      const result = response.data;
      const msg = type === "add" ? "创建用户" : "修改用户";
      if (result.status === 1) {
        logInfo(`${msg}成功。`);
        message.success(`${msg}成功。`);
        return true;
      } else {
        logInfo(`${msg}失败！`);
        message.failure(`${msg}失败！`);
        return false;
      }
    } catch (ex) {
      console.error(ex);
      message.failure("保存短语失败", ex.message || ex.toString());
    } finally {
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const wait = await fetch.delete<ManageResponse>(`/sysUserAccount/delete/${id}`);
      Promise.resolve(wait).then(response => {
        const result = response.data;
        if (result.status === 1) message.success("删除账号成功。");
      });
    } catch (ex) {
      console.error(ex);
      message.failure("发生错误", ex.message || ex.toString());
    } finally {
    }
  }, []);

  return { save, remove };
};

export default useUserAccount;

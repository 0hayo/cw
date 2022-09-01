import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { external } from "utils/fetch";
import { postLogin } from "store/actions/auth";
import { getAppType, LOCAL_NET_IP, LOCAL_MACHINE_ID } from "misc/env";

const useAuth = (): {
  auth: (username: string, password: string) => Promise<LoginResult>;
  loading: boolean;
} => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const appType = getAppType();
  console.log("LOCAL IP=", LOCAL_NET_IP, " LOCAL_MACHINE_ID=", LOCAL_MACHINE_ID);

  const auth = useCallback(
    async (username: string, password: string): Promise<LoginResult> => {
      setLoading(true);
      const loginUrl =
        appType === "control"
          ? `/login?account=${username}&password=${password}`
          : `/radio/login?account=${username}&password=${password}&radioUuid=${LOCAL_MACHINE_ID}`; //使用本机机器ID
      // : `/radio/login?account=${username}&password=${password}&radioUuid=${LOCAL_NET_MAC}`; //使用本地MAC地址
      const result = await external.post(loginUrl);
      const data = result.data;
      console.log("Login return data===", JSON.stringify(data));
      const success = data.status === 1 ? true : false;
      if (success) {
        const token = data.data.accessToken;
        const name = data.data.name;
        const account = data.data.account;
        const roles = data.data.roles;
        const group = {
          group_id: data.data.groupId,
          group_name: data.data.groupName,
        };
        const idNum = data.data.idNumber;
        const empNo = data.data.empno;
        // let role
        const user: IUser = {
          uuid: data.data.uuid,
          userName: name,
          account,
          roles,
          groupName: group.group_name,
          groupId: group.group_id,
        };
        const authData: AuthReducer = {
          token,
          display_name: name,
          user_name: account,
          id_number: idNum,
          roles,
          group,
          emp_no: empNo,
        };
        dispatch(postLogin(authData));
        return {
          success: true,
          message: `${name}，欢迎回来`,
          code: 200,
          user,
        };
      } else {
        setLoading(false);
        return {
          success: false,
          message: data.msg ? data?.msg : "登录失败",
          code: data.status,
          user: null,
        };
      }
    },
    [appType, dispatch]
  );

  return { auth, loading };
};

export default useAuth;

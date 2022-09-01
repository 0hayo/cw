import { ThunkAction } from "redux-thunk";
// import fetch from "utils/fetch";

// export const login = (user: {
//   account: string;
//   password: string;
// }): ThunkAction<any, any, any, PayloadAction<AuthReducer>> => {
//   return async dispatch => {
//     const { data } = await fetch.post<MstResponse>(
//       `/login?account=${user.account}&password=${user.password}`
//     );
//     dispatch({
//       type: "auth/set",
//       payload: {
//         token: data.data.accessToken,
//         roles: [],
//         user_name: "",
//         display_name: "",
//         group: { group_id: "", group_name: ""}
//       },
//     });
//   };
// };

// export const login = (form: {
//   username: string;
//   password: string;
// }): ThunkAction<any, any, any, PayloadAction<AuthReducer>> => {
//   return async dispatch => {
//     const { data } = await fetch.post<MstResponse>("/auth/user/_signin", JSON.stringify(form));

//     dispatch({
//       type: "auth/set",
//       payload: {
//         token: data.data.token,
//         role: data.data.user.role,
//         user_name: data.data.user.name,
//         display_name: data.data.user.display_name,
//       },
//     });
//   };
// };

export const logout = (): ThunkAction<any, any, any, PayloadAction<AuthReducer>> => {
  return dispatch => {
    // fetch.post<MstResponse>("/user/logout");
    dispatch({
      type: "auth/set",
      payload: {
        token: "",
        user_name: "",
        display_name: "",
        id_number: "",
        emp_no: "",
        roles: [],
        group: { group_id: "", group_name: "" },
      },
    });
  };
};

//login - new :编写目的：在异步action中我没有发现方法暴露登录错误信息，将请求外放，action只更新数据
export const postLogin = (data: AuthReducer) => ({ type: "auth/set", payload: data });

import { AxiosError } from "axios";
import { ThunkAction } from "redux-thunk";
import messenger from "misc/message";
import React from "react";
import McProvider from "containers/mc-provider";
import McLoginModal from "components/mc-login-modules/login-modal";
import { getAppType } from "../../misc/env";

export const success = (
  text: string
): ThunkAction<any, any, any, PayloadAction<Partial<UIReducer>>> => {
  return async dispatch => {
    dispatch({
      type: "ui/update",
      payload: {
        message: {
          text,
          variant: "success",
        },
      },
    });
  };
};

export const failure = (
  error?: AxiosError
): ThunkAction<any, any, any, PayloadAction<Partial<UIReducer>>> => {
  const status = error.response?.status;
  const url = error.response?.config?.url;
  const isLogout = url ? url.indexOf("logout") >= 0 : false;
  const isLogin = url ? url.indexOf("login") >= 0 : false;
  const isFileResource = url ? url.indexOf("files") >= 0 : false;

  const showErrMsg = (msg: string) => {
    if (!isLogin && !isLogout) {
      messenger.destroy();
      messenger.failure(msg);
    }
  };

  let text = error.response ? error.response.data.msg : error.message || error.name;

  switch (status) {
    case 401:
      if (getAppType() === "single") break;
      text = "您未登录或登录超时，请重新登录！";
      const logoutBtns = (
        <McProvider>
          <McLoginModal />
        </McProvider>
      );
      messenger.destroy();
      messenger.failure(text, logoutBtns, true);
      break;
    case 400:
      text = "无效的请求。";
      if (!isLogin && !isLogout) {
        showErrMsg(text);
      }
      break;
    case 403:
      text = "认证错误，请重新登录！";
      showErrMsg(text);
      break;
    case 404:
      if (!isFileResource) {
        text = "系统错误，请求的资源不存在！";
        showErrMsg(text);
      }
      break;
    case 500:
      text = "后台程序错误。";
      showErrMsg(text);
      break;
    case 503:
      text = "后台服务错误。";
      showErrMsg(text);
      break;
    default:
      messenger.destroy();
      showErrMsg(text === "Network Error" ? "请检查服务模块。" : text);
  }

  return async dispatch => {
    dispatch({
      type: "ui/update",
      payload: {
        message: {
          text,
          variant: "error",
        },
      },
    });
  };
};

export const warning = (
  text: string
): ThunkAction<any, any, any, PayloadAction<Partial<UIReducer>>> => {
  return async dispatch => {
    dispatch({
      type: "ui/update",
      payload: {
        message: {
          text,
          variant: "warning",
        },
      },
    });
  };
};

export const message = (
  text: string
): ThunkAction<any, any, any, PayloadAction<Partial<UIReducer>>> => {
  return async dispatch => {
    dispatch({
      type: "ui/update",
      payload: {
        message: {
          text,
          variant: "info",
        },
      },
    });
  };
};

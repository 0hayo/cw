import store from "store";
import { load } from "store/actions/ui";
import { failure } from "store/actions/notify";
import axios, { AxiosError, AxiosInstance } from "axios";
import { bizServerAPIPath } from "misc/env";

export const outer = axios.create({
  withCredentials: false,
  // timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const external = axios.create({
  baseURL: bizServerAPIPath,
  // timeout: 10000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export const internal = axios.create({
  baseURL: bizServerAPIPath,
  withCredentials: true,
  // timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  transformRequest: (data, headers) => {
    const state = store.getState();
    if (state.auth.token) {
      headers.common["Authorization"] = `Bearer ${state.auth.token}`;
    }
    return data;
  },
});

const wrap = (instance: AxiosInstance) => {
  instance.interceptors.request.use(config => {
    store.dispatch(load(1) as any);
    return config;
  });

  instance.interceptors.response.use(
    res => {
      store.dispatch(load(-1) as any);
      return res;
    },
    (error: AxiosError) => {
      store.dispatch(load(-1) as any);
      console.error("请求后台资源错误：", error.response);
      store.dispatch(failure(error) as any);
      return Promise.resolve({
        status: -1,
        msg: error.response?.data.msg,
        message: error.response?.data.msg,
        data: error.response?.data
          ? error.response?.data
          : {
              status: -1,
              msg: "error",
            },
      });
    }
  );
};

wrap(internal);
wrap(external);
wrap(outer);

export default internal;

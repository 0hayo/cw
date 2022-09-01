import store from "../store";
import { getAppType, LOCAL_MACHINE_ID as radioUuid } from "./env";
import fetch from "../utils/fetch";

export const FIELDS = ["FROM", "NR", "CK", "CLS", "DATE", "TIME", "SIGN", "RMKS", "TO"];
const EX_FIELDS = ["FROM", "NR", "TIME", "SIGN", "RMKS"];

export const index2label = (
  index: number,
  type: TelegramBizType,
  role: "head" | "body"
): string => {
  if (role === "body") {
    return [Math.ceil((index + 1) / 100) + "P", (index % 100) + 1 + "W"].join("");
  }

  if (role === "head" && type === "EX") {
    return ["来自", "号数", "时间", "记时/签名", "附注"][index];
    // return ["来自", "号数", "时间", "附注"][index];
  }

  return ["来自", "号数", "组数", "等级", "月日", "时分", "记时/签名", "附注"][index];
  // return ["来自", "号数", "组数", "等级", "月日", "时分", "附注"][index];
};

export const index2field = (
  index: number,
  type: TelegramBizType,
  role: "head" | "body"
): string => {
  if (role === "body") {
    return index.toString();
  }

  if (role === "head" && type === "EX") {
    // return ["FROM", "NR", "TIME", "SIGN", "RMKS"][index];
    return EX_FIELDS[index];
  }

  // return ["FROM", "NR", "CK", "CLS", "DATE", "TIME", "SIGN", "RMKS"][index];
  return FIELDS[index];
};

export const field2index = (
  field: string,
  type: TelegramBizType,
  role: "head" | "body"
): number => {
  if (role === "body") {
    return isNaN(parseInt(field)) ? -1 : parseInt(field);
  }

  if (role === "head" && type === "EX") {
    return EX_FIELDS.indexOf(field);
  }

  return FIELDS.indexOf(field);
};

export const sleep = (ms: number = 10) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const logInfo = (msg: string) => {
  // alert(store.getState().auth.user_name);
  const logParam = {
    account: store.getState().auth.user_name,
    // radioName: "",
    radioUuid: getAppType() === "control" ? "" : radioUuid,
    remark: msg,
  };
  return fetch.post<ManageResponse>("/sysOperationLog/insert", JSON.stringify(logParam));
};
export const logRxTxTime = (type: string, startTime: string, endTime: string) => {
  const logParam = {
    account: store.getState().auth.user_name,
    // radioName: "",
    radioUuid: getAppType() === "control" ? "" : radioUuid,
    type: type,
    startTime: startTime,
    endTime: endTime,
  };
  return fetch.post<ManageResponse>("/sysRadioOperational/insert", JSON.stringify(logParam));
};

//允许输入的字符:A~Z, a~z, 0~9, ?, ;, /, !, @, #, ^, *, Ü, +, ', =, 空格
const pattern: RegExp = /[^A-Za-z0-9?;/!@#^*Ü+=' ]/g;
/** 检查要发送的短语内容，如果检查通过，则返回{}，如果有非法字符，则返回第一个非法字符的索引位置 */
export const checkTxContent = (content: string): IContentCheckResult => {
  if (!content) return { result: true };
  const test = pattern.exec(content);
  console.log("reg pattern exec====", test);
  if (test) {
    const firstIndex = test.index;
    const chars = content.match(pattern);
    console.log("reg pattern match====", chars);
    return {
      result: false,
      chars,
      firstIndex,
    };
  }
  return { result: true };
};

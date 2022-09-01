import { IForm } from "./typing";
import isEmpty from "lodash/isEmpty";
import { empty } from "misc/telegram";

const validate = (data: IForm): string | void => {
  if (isEmpty(data.name)) {
    return "请输入: 报文名称";
  }

  if (isEmpty(data.date)) {
    return "请输入: 日期时间";
  }

  if (empty(data.head) && empty(data.body)) {
    return "请输入: 报头/报文";
  }
};

export default validate;

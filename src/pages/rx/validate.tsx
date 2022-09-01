import { IForm } from "./typing";
import isEmpty from "lodash/isEmpty";

const validate = (data: IForm): string | void => {
  if (isEmpty(data.name)) {
    return "请输入: 报文名称";
  }

  if (isEmpty(data.date)) {
    return "请输入: 日期时间";
  }
};

export default validate;

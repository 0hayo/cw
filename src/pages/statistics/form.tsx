// import { number } from "echarts";

// 电台请求参数
export interface IRadioPages {
  currentPage: number; //请求 第几页
  pageSize: number; // 请求条数
}

// 电台详细信息

// 电台列表
export interface IRadioList {
  currentPage?: number; // 当前页
  pageSize?: number; // 请求条数
  totalNum?: number; // 总条数
  totalPage?: number; // 总页数
  items?: IRadioItem[]; // 详情内容
}

// 收发 总报数
export interface IForm {
  sendTotal: number; // 发送总数量
  collectTotal: number; // 接收数量
  avgSendDaily: number; //平均每日发报
  avgCollectDaily: number; //平均每日收报
  avgSendWeekly: number; //平均每周发报
  avgCollectWeekly: number; //平均每周收报
  onlineTime: number; // 在线时长
  standbyTime: number; // 待机时长
  avgTimeDaily: number; //平均每日在线时长
  avgTimeWeekly: number; //平均每周在线时长
  txWorkedHours: number; // 发报工作时长
  rxWorkedHours: number; // 收报工作时长
}

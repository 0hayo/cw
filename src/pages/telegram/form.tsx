//  定义待发报文
export interface IPropsTelegram {
  currentPage: number; //当前页
  pageSize: number; // 请求条数
  totalNum: number; // 总条数
  totalPage: number; // 总页数
  items: ITelegram[]; //分页数据详情
}

// 选择待发报文弹窗
export interface ITelegramModal {
  visible: boolean;
  onCancel?: VoidFunction; // 点击取消按钮
  onOk?: (name: string, uuid: string, radioUuid: string) => void; // 点击确定按钮
}

// 分页请求参数
export interface IFormPages {
  currentPage: number; //当前页
  pageSize: number; // 请求条数
  completeFlag: number; //完成标志  0 未完成  1 已完成
  radioUuid: string; // 获取 电台UUid
  // orderStr: "start_time asc" | "end_time desc" | "name asc"; // 选择排序方式
  orderStr: string; // 选择排序方式
  type?: number;
  status?: number;
}

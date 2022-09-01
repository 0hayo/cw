export interface IForm {
  keyword: string;
  loading: boolean;
  folders: McTelegramStat[];
  sortord: "stime" | "name";
  radioUuid: string;
  checked: McTelegramStat[];
  type: string;
  page: number; //当前页码
  pageSize: number; //每页数据条数
  totalNum: number;
  totalPage?: number;
}

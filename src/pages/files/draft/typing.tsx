export interface IForm {
  radioUuid: string;
  keyword: string;
  loading: boolean;
  folders: McTelegramStat[];
  checked: McTelegramStat[];
  sortord: "stime" | "name";
  page: number; //当前页码
  pageSize: number; //每页数据条数
  totalNum: number;
  totalPage: number;
}

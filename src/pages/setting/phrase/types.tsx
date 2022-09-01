export interface IPhraseForm {
  currentPage?: number; // 当前页
  pageSize?: number; // 请求条数
  totalNum?: number; // 总条数
  totalPage?: number; // 总页数
  items?: IPhraseItem[]; // 详情内容
}

export interface IPhraseItem {
  id: number;
  type: string;
  datagram: string;
  content: string;
  mode: "edit" | "save" | "preset" | "new";
}

export interface IForm {
  keyword: string;
  radioUuid: string;
  loading: boolean;
  folders: McFolderMeta[];
  checked: McFolderMeta[];
  sortord: "date" | "name";
  files: FileList | null;
  page: number; //当前页码
  pageSize: number; //每页数据条数
  totalNum: number;
  totalPage: number;
}

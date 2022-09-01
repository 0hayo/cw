interface IContactTableSettingForm {
  contactTables: ISysContactTable[];
  activeContactTable: ISysContactTable;
  add: boolean;
  reload: boolean;
}

interface IContactTableFromPages {
  currentPage: number; //请求 第几页
  pageSize: number; // 每页条数
  contactId: number; // 联络表id ,
  orderStr?: "created_at asc" | "created_at desc"; // 正序 倒序
}

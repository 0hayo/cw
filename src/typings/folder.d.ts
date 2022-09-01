interface McFolderMeta {
  id: string;
  path: string;
  name: string;
  date: string;
  mode?: McUploadFileType; //文件类型
  type?: TelegramBizType | ""; //业务类型
  files?: string[];
}

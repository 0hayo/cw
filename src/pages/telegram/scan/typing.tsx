export interface IForm {
  telegramUuid: string;
  dir?: string;
  page: number;
  size: number;
  modal: boolean;
  modalTd?: boolean;

  head: McTelegramHash;
  body: McTelegramHash;
  images: IScanImage[];
  imgdir: string;
  sysFilesId: string;

  type: TelegramBizType | undefined;
  mode: "PIC" | "DOC" | "JSON" | undefined;
  name: string;
  date: string;

  /** 选中区块 */
  role: "head" | "body";
  /** 偏移位置 */
  offset: number;

  saved: boolean;
  warn?: boolean;
  active: number;
}

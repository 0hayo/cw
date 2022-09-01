export interface IForm {
  dir?: string;
  page: number;
  size: number;
  modal: boolean;
  modalTask?: boolean;

  /** 报文类型 */
  type: TelegramBizType;
  /** 报文名称 */
  name: string;
  /** 发送时间 */
  date: string;

  /** 报头内容 */
  head: McTelegramHash;
  /** 报文内容 */
  body: McTelegramHash;

  /** 选中区块 */
  role: "head" | "body";
  /** 偏移位置 */
  offset: number;

  saved: boolean;
  warn: boolean;
  active: number;
  /** 电报通讯方式 CW-等幅报 DATA-数据报 TEL-话务报  */
  datagramType?: string;
}

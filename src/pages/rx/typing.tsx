import { MceFlag } from "mce/typing";
import { Dispatch, SetStateAction } from "react";
import cwIForm from "../cw/form";
export type setter = Dispatch<SetStateAction<IForm>>;

export interface IForm {
  /** 报文目录 */
  dir: string;

  /** 报文类型 */
  type: TelegramBizType;
  /** 报文名称 */
  name: string;
  /** 完成时间 */
  date: string;
  /** 报文状态 */
  state: "none" | "check";

  /** 报文页码 */
  page: number;
  /** 报文页数 */
  size: number;
  /** 概率符号 */
  flag: MceFlag;

  /** 选中区块 */
  role: "head" | "body";
  /** 选中报码 */
  code: string;
  /** 偏移位置 */
  offset: number;

  /** 发送进度 */
  progress: number;
  /** 正在发送 */
  transmit: boolean;
  /** 是否开始工作 */
  isStar?: boolean;

  /** 正在输入 */
  feed: Message;
  feedRx?: Message;
  qsyShow?: boolean;
  errorShow?: boolean;
  qsyMsg?: string;
  sendString?: string;
  /** 回复选项 */
  hint: Array<{
    label: string;
    value: string;
  }>;

  /** 报头内容 */
  head: McTelegramHash;
  /** 报文内容 */
  body: McTelegramHash;

  a: TelegramEx;
  b: TelegramEx;
  ab: "a" | "b";

  /** 保存整报结果 */
  regular: {
    head: McTelegramHash;
    body: McTelegramHash;
    page: number;
    size: number;
    offset: number;
    role: "head" | "body";
  };

  /** 拍摄图片 */
  pictures: IScanImage[];
  /** 沟通消息 */
  messages: Message[];

  /** 当前场景 */
  scene: "ready" | "copy" | "check" | "regular" | "";
  /** 会话目录 */
  session?: McSession;

  /** 发送速率 */
  speed: number;

  soundFlag?: boolean;

  ui: {
    chat: boolean;
    code: boolean;
    save: boolean;
    print: boolean;
    /** 是否有警告 */
    warn: boolean;
    contact?: boolean;
    loading: boolean;
  };
  phystatus: boolean;
  /** 点亮哪个格子（而非报文） */
  active: number;
  /** 是否开启收报连接 */
  receive: boolean;
  leave: boolean;
  autoFlag?: number;
  sendStatus?: boolean;
  sendNumber?: number;

  //联络信息
  contactTableId?: number;
  otherName?: string;
  ownName?: string;
  telegramCode?: string;
  otherCode?: string;
  ownCode?: string;
  telegramCodeOther?: string;
  otherCodeOther?: string;
  ownCodeOther?: string;
  workNumber?: string;

  taskid?: string;
  cwTitle?: string;
  startTime?: string;
  endTime?: string;

  saved: boolean;
}

export interface IProps {
  form: IForm;
  setForm: Dispatch<SetStateAction<IForm>>;
  cwForm?: cwIForm;
  setCwForm?: (x) => void;
}

export interface TelegramEx {
  head: McTelegramHash;
  body: McTelegramHash;
  page: number;
  size: number;
}

export const DUMB_FEED: Message = {
  uuid: "",
  type: "tx",
  crude: "",
  value: "",
  ratio: [0],
  complete: false,
  sendStatus: false,
};

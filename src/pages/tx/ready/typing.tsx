export interface IForm {
  taskid?: string;
  /** 文件目录 */
  dir?: string;
  /** 选中报码 */
  code: string;
  feed: Message;
  feedRx?: Message;

  /** 报文名称 */
  name: string;
  /** 发送完成时间 */
  sdate: string;
  /** 计划发送时间 */
  pdate: string;
  date?: string;

  hint: Array<{
    label: string;
    value: string;
  }>;

  /** 当前页面 */
  page: number;
  /** 页面总数 */
  size: number;
  role: "head" | "body";
  /** 报文类型 */
  type: TelegramBizType;
  types?: TelegramBizType;
  isTb?: boolean;

  headRmks?: string;

  /** 发送速率 */
  speed: number;
  soundFlag?: boolean;
  /** 发送进度 */
  progress: number;
  /** 发送状态 */
  transmit: boolean;
  /** 是否发送完成 */
  finish: boolean;
  /** 是否开始工作 */
  isStar?: boolean;

  /** 报头内容 */
  head: McTelegramHash;
  /** 报文内容 */
  body: McTelegramHash;

  /** 检查报底 */
  check: {
    head: McTelegramHash;
    body: McTelegramHash;
    offset: number;
    page: number;
    size: number;
    active: number;
  };

  /** 沟通消息 */
  messages: Message[];

  session?: McSession;

  ui: {
    save: boolean;
    exit: boolean;
    prepare: boolean;
    autoPage: boolean;
    send: boolean;
    print?: boolean;
    contact?: boolean;
  };
  //发送/重发电文的模态框
  send: {
    role: "head" | "body";
    dx: number;
    dy: number;
    /** 是否重发 */
    repeat: boolean;
    /**是否连续发送 */
    continuous: boolean;
    /** 是否整篇报文发送 */
    whole: boolean;
    page: number;
  };
  phystatus: boolean;
  autoFlag?: number;
  sendStatus: boolean;
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
  telegramGradeType?: string;
  telegramGradeCode?: string;
  workNumber?: string;
  telegramLevel: string;

  qsyShow?: boolean;
  qsyMsg?: string;
  sendString?: string;
  startTime?: string;
  endTime?: string;
  telegramModal?: boolean;
}

export const DUMB_FEED: Message = {
  uuid: "",
  type: "tx",
  crude: "",
  value: "",
  ratio: [0],
  complete: false,
};

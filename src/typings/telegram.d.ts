interface McTelegram {
  /** 报头 */
  head: McTelegramHash;
  /** 报文 */
  body: McTelegramHash;
}

interface McTelegramHash {
  [x: string]: McTelegramWord | undefined;
}

interface McTelegramCopy {
  a: McTelegram;
  b: McTelegram;
}

interface McTelegramMeta {
  /** 来源 */
  from: "text" | "code" | "scan" | "recv" | "send";
  /** 类型 */
  type: TelegramBizType;
  /** 名称 */
  name: string;

  /** 保存时间 */
  stime: string;
  /** 计划时间 */
  ptime: string;

  /** 状态(none: 未校报，check：已校报) */
  state?: "none" | "check";
  /** 完成？ */
  finish?: boolean;
  /** OCR src image dir */
  imgdir?: string;
  mode?: "PIC" | "DOC"; //来源文件是图片还是DOC文档
  sysFileId?: string;
  taskId?: string;
  datagramUuid?: string;
}

interface McTelegramStat extends McTelegramMeta {
  path: string;
}

interface McSession {
  /** 会话目录 */
  path: string;
  /** 会话名称 */
  name: string;
  /** 音频文件 */
  file: string;
  /** 文件是否还存在 */
  exists?: boolean;
}

interface McTelegramWord {
  /** 当前报码 */
  value: string;
  /** 原始报码 */
  crude?: string;
  /** 对比报码 */
  extra?: string;
  /** 准确概率 */
  ratio?: number[];
  /** 对比图片 */
  image?: string;
  /** 当前状态 */
  state?: "none" | "diff" | "pass" | "fail" | "active";
  /** 音频偏移 */
  offset?: number;
  /** 音频长度 */
  length?: number;
  /** 是否显示警告 */
  warn?: boolen;
  /** 是否高亮 */
  light?: boolean;
}
/**  办报工作台 收发报文记录 **/
interface McDatagramItem {
  uuid: string;
  createUserUuid: string;
  createdAt: string;
  updateUserUuid: string;
  updatedAt: string;
  remark: string;
  status: number;
  delFlag: string;
  name: string;
  type: string;
  newModel: string;
  path: string;
  datagramDraftItemList: string;
}

type McUploadFileType = "PIC" | "DOC" | "JSON" | "?";

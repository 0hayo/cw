interface Message {
  uuid: string;
  /** 消息类型 */
  type: "tx" | "rx";
  /** 原始文本 */
  crude: string;
  /** 最新文本 */
  value: string;
  /** 没发送完的文本 */
  left?: string;
  /** 准确概率 */
  ratio: number[];
  /** 音频路径 */
  path?: string;
  /** 音频偏移 */
  offset?: number;
  /** 音频长度 */
  length?: number;
  /** 发生时间 */
  time?: string;
  /** 状态 */
  complete?: boolean;
  canceled?: boolean;
  origin?: {
    text: string;
    offsets: number[];
    lengths: number[];
    qualities: number[];
  };
  sendStatus?: boolean;
  idx?: number;
}

interface Feed {
  content: string;
  type: "tx" | "rx";
}

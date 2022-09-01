/**
 * 文书
 */
interface MstDocument {
  uuid: string;
  /** 文书图片内容(base64编码) */
  image?: string;
  /** 文书文件 */
  file?: string;
  /** 发送电台UUID */
  sendTransceiverUuid: string;
  /** 接收台站的代码 */
  acceptStationCode: string;
  /** 接收台站的名称 */
  acceptStationName: string;
  /** 网系UUID */
  curContactNetUuid: string;
  /** 主题 */
  theme: string;
  /** 联络文件表UUID */
  curContactListUuid: string;
  /** 内容 */
  content: string;
  /** 是否已签收 */
  isSign: string;
  /** 是否已阅 */
  isRead: string;
  /** 数据库记录状态 */
  status: string;
};
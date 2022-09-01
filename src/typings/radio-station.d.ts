/** 通讯台站 */
interface MstStation {
  uuid: string;
  stationName: string;
  code: string;
  /** 所属网系 */
  networkId: string;
  /**本台标志 Y-代表是，N-代表不是  */
  nativeFlag: "Y" | "N";
  /** 联络文件表ID */
  contactListUuid: string;
  stationName: string;
  stationCode: number;
  /** 报呼被呼号  */
  msgCallNum: string;
  /** 报呼自用号 */
  msgOwnUserNum: string;
  /** 话呼被呼号 */
  telOwnNum: string;
  /** 讯序号  */
  contactTransceiverIndex: string;
  /** 网络地址 */
  netAddress: string;
  /** 单台地址 */
  singleAddress: string;
  /** 主属标志 Z: 主台，S: 属台 */
  primaryFlag: "Z" | "S";
  /** 属台序号 */
  belongSeq: number;
  /** 本站电台UUID */
  nativeTransceiverUuid: string;
  /** 型号 */
  type: string;
  /** 自适应控制器标识（同步|异步） */
  adapterFlag: AdaptorFlag;
  /** 通讯电台使用规则 */
  useRuleList: null;
  /** 新老标志：Y 新设备，N 老设备 */
  newFlag: "Y" | "N";
  /** 建链状态 */
  linkStatus: LinkStatus;
  remark: string;
  status: number;
}

/** 本地台站信息 */
interface MstLocalStation {
  uuid: string;
  name: string;
  code: string;
  logo?: string;
}

interface MstNetwork {
  uuid: string;
  name: string;
  code: string;
  contactStationList: MstStation[];
  remark: string;
  status: number;
}

/** 电台 */
interface MstRadio {
  uuid: string;
  /** 自适应控制器标识	同步: SYN /异步: ASYN */
  adapterFlag?: AdaptorFlag;
  code?: string;
  name?: string;
  /** 终端类型 */
  type?: string;
  /** 所属台站 */
  stationUuid?: string;
  /** 当前联络人列表 */
  curContactListUuid?: string;
  /** 当前网系 */
  curContactNetUuid?: string;
  /** 值守（守听）模式 */
  dutyModeFlag?: "Y" | "N";
  /** （数据终端）IP地址 */
  ip?: string;
  remark?: string;
  status?: number;
  sessionName?: string;
}

/** 通讯频率 */
interface MstContactFreq {
  uuid: string;
  /** 信道代码 "01"、"02"... */
  channelCode?: string;
  /** 信道组 */
  channelGroup: string;
  /** 联络表UUID */
  contactListUuid: string;
  /** 收频 */
  receiveFreq: string;
  /** 收频组 */
  receiveFreqGroup?: string;
  /** 发频 */
  sendFreq: string;
  /** 发频组 */
  sendFreqGroup?: string;
  remark?: string;
  status: number;
}

/** 使用规则（频率和信道分配规则） */
interface MstFreqRule {
  uuid: string;
  /** 属台序号 */
  belongSeq: number;
  /** 信道组 */
  channelGroup: string;
  /** 联络表UUID */
  contactListUuid: string;
  /** 主属标志 Z: 主台，S: 属台 */
  primaryFlag: "Z" | "S";
  remark: string;
  status: number;
  /** 使用规则详情(频率集分配) */
  contactFreqList: MstContactFreq[];
}

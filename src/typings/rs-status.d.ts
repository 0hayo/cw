/**
 * 电台状态
 */
interface MstRsStatus {
  /** 状态类型：S:发送，R:接收 */
  statusType: "S" | "R";

  /** 电台类型（暂定）：
   * 1:125W九五模拟化电台
   * 2:125W九五数字化电台
   * 3:125W十五电台
   * 4:400/1000W九五电台
   * 5:400/1000W十五电台
   */
  radioType?: string;

  /** 当前信道组号 1~9 */
  channelGroup?: string;

  /** 本站地址索引，取值范围：00-99 */
  localAddressIndex?: string;
  /** 本站地址 */
  localAddress?: string;
  /** 本地信号等级（对方发频质量） */
  localSignal?: string;
  /** 单台地址 */
  singleAddress?: string;
  /** 网络地址 */
  netAddress?: string;
  /** 他站地址索引，取值范围：00-99 */
  remoteAddressIndex?: string;
  /** 对方信号等级（本方发频质量） */
  remoteSignal?: string;
  /** 他站地址 */
  otherAddress?: string;

  /** 信道代码：01, 02, 03, AA ...等 */
  channelCode?: string;

  /** 工作频率：单位 10Hz */
  freq?: number;
  /** 频率类型 */
  frequencyKind?: string;
  /** 频率版本 */
  frequencyVersion?: string;

  /** 工作种类（发射机/接收机）
   * am:调幅话
   * usb:上边带
   * lsb:下边带
   * cw:等幅报
   * isb:独立边带
   */
  workKind?: "am" | "usb" | "lsb" | "cw" | "isb" | "none";

  /** （自适应控制器）工作状态
   * 2:扫描2
   * 5:扫描5
   * D:直接
   * F:闲置
   * M:人工
   * P:探测
   * C:呼叫
   * L:建链
   * N:未知
   */
  workStatus?: "2" | "5" | "D" | "F" | "M" | "P" | "C" | "L" | "N";

  /** （电台）工作方式
   * 0:单工
   * 1:双工
   * 2:半双工
   */
  workStyle?: 0 | 1 | 2;

  /** (电台)功率等级
   * high:高
   * med:中
   * low:低
   */
  power?: "high" | "med" | "low";

  /** 卫星类型 */
  startKind?: string;
}

/** 电台状态窗口显示的滚动信息（可根据根据电台各种状态参数的变化来生成） */
interface RollStatusInfo {
  radioUuid: string;
  timestamp: number;
  content: string;
}

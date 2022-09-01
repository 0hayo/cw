interface ITaskModal {
  radioUuid?: string;
  radioName?: string;
  visible: boolean;
  datagramUuid?: string; // 待发报文uuid
  datagramTitle?: string; // 待发报文标题
  radioUuidCurrent?: string; //设备终端
  taskName?: string; // 任务名称
  startTime?: string; // 任务开始时间
  remindTime?: number; //任务提醒时间
  workType?: string; //工作方式 1 发报  2 收报
  remindLength?: number; // 任务提醒时间 类型
  mode?: "add" | "edit"; // 新增或修改
  id?: number; // 要修改任务列表的Id
}

// // 电台（终端）列表
// interface IRadioList {
//   currentPage?: number; // 当前页
//   pageSize?: number; // 请求条数
//   totalNum?: number; // 总条数
//   totalPage?: number; // 总页数
//   items?: IRadioItem[]; // 详情内容
// }

// 电台详细信息
interface IRadioItem {
  contactId: number; //网系ID号
  uuid: string; // Uuid
  stationUuid: string; // 台站ID
  name: string; // 电台名称
  code: string; // 电台代号
  type: string; // 型号
  ip: string; // IP地址
  status: number; // 设备状态，0(未接管)，1(已接管) -1(离线)
  workStatus: number; //工作状态， 1(正在发报)， 2(正在收报)， 0(待机)
  userAccountUuid: string; //当前登录账号UUID
  account: string; //当前登录账号
  userName: string; //当前登录用户名
  delFlag: number; // 删除标记
  remark: string; //备注
  createUserUuid: string; //创建者
  updateUserUuid: string; //更新者
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
  timeLong: string; //在线时长
  completeNumber: number; // 完成任务
  incompleteNumber: number; // 未完成任务
  taskStatus: number; // 任务情况   0 无任务任务   1 有待发任务   2 任务都已经完成
  timeStart: string; // 即将开始
  datagramName: string; // 即将开始报文
  beginTime: string; // 待发时间
  createTime: string; // 创建时间
  active: boolean; // 是否选中 设备
  libraryVersion: string; // 版本型号
  authorizationFlag: 0 | 1; //0未注册，1注册
}

// 任务列表 响应参数
interface ITaskList {
  currentPage: number; //当前页
  pageSize: number; // 请求条数
  totalNum: number; // 总条数
  totalPage: number; // 总页数
  items: ITask[]; //分页数据详情
}

/** 任务收发类型 1(发报), 2(收报) */
type TaskType = "1" | "2";

interface ITask {
  id?: number;
  contactTableId?: number; // (integer, optional): 联络表ID
  otherTelegramCode?: string; // (string, optional): 它台电报代号  注：需要获取，网系下的所有ID
  radioUuid?: string; // 电台id
  radioName?: string; // 电台名称
  datagramUuid?: string; // 报文UUID
  name: string; //任务名称
  /** 收发类型：1(发报), 2(收报) */
  type: TaskType;
  bizType: string; // 业务类型：1(通信检查)
  workType: string; // 任务类型：1(普通任务), 2(计划任务)
  content?: string; // 附件内容
  startTime?: string; // 开始时间
  endTime?: string; // 完成时间
  realStartTime?: string; // (string, optional): 实际开始时间
  remindTime?: string; // 提醒时间
  completeFlag: 0 | 1; // 完成标记
  completeUserName?: string; //完成任务的用户名称
  status?: number; //状态
  delFlag?: number; //删除标记
  remark?: string; //备注
  createUserUuid?: string; //创建人
  updateUserUuid?: string; //修改人
  createdAt?: string; //创建时间
  updatedAt?: string; //修改时间
  title: string; //关联报文标题
  orderStr?: string; //排序方式
  remindLength?: number; // 提醒时间(分钟)
  bizType?: string;
  workType?: string;
  contactTableId?: number; //网系ID
  completeUserName?: string;
  datagrams?: ITelegram[];
}

//电子报底 请求
interface ITelegram {
  uuid: string; // uuid
  radioUuid?: string; // 电台uuid
  title: string; // 报文名称
  type: string; // 1：发报 2：收报
  createdAt?: string; //创建时间
  updatedAt?: string; // 更新时间
  updateUserUuid?: string;
  status?: number;
  remark?: string;
  orderStr?: string;
  newModel?: string;
  createUserUuid?: string;
  createUserName?: string;
}

/** 报文业务类型 CW: 等幅报， EX：无线电信号 */
type TelegramBizType = "CW" | "EX" | "CCK" | "TB";

/** 分页查询结果 */
interface IPageResult<T> {
  currentPage?: number; // 当前页
  pageSize?: number; // 请求条数
  totalNum?: number; // 总条数
  totalPage?: number; // 总页数
  items?: T[]; // 详情内容
}

//////////////////////////////settings interface//////////////////////////////////////////////
interface ISysContactTable {
  id?: number; // (integer, optional): 编号 ,
  contactName: string; // (string, optional): 联络表名称 ,
  createUserUuid?: string; // (string, optional): 创建者 ,
  createdAt?: string; // (string, optional): 创建时间 ,
  delFlag?: number; // (integer, optional): 删除标记 ,
  startTime?: string; // (string, optional): 开始时间 ,
  endTime?: string; // (string, optional): 开始时间 ,
  remark?: string; // (string, optional): 备注 ,
  updateUserUuid?: string; // (string, optional): 更新者 ,
  updatedAt?: string; // (string, optional): 更新时间
}

/** 电报呼号 */
interface ITelegramCode {
  id: number;
  telegramCode: string;
  otherCode: string;
  ownCode: string;
  contactId: number;
  name?: string;
  primaryFlag?: string;
  belongSeq?: number;
  nativeFlag?: string;
  remark?: string;
  createUserUuid?: string;
  updateUserUuid?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 电报等级 */
interface ITelegramGrade {
  id: number;
  code: string;
  text: string;
  contactTableId: number;
  type: number;
  delFlag?: number;
  remark?: string;
  createUserUuid?: string;
  updateUserUuid?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 识别暗令 */
interface IIecCode {
  id: number;
  row: number; //第几行
  column: number; //第几列
  code: string;
  contactId: number;
  remark?: string;
}

/** 真伪码 */
interface IMaskCode {
  id: number;
  realCode: string;
  pseudocode: string;
  contactId: number;
}

/** 真伪码转换结果 */
interface IMaskCodeTransResult {
  /** 是否转换成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
  /** 真码 */
  realCode: string;
  /** 伪码 */
  maskCode: string;
}

///////////////////////////////ui interface//////////////////////////////////
interface IDevState {
  //网系ID号
  uuid: string; //设备ID号 key
  contactName?: string; //网系名称
  contactId?: number; //网系ID号码
  status?: number; // 设备状态
}

interface IUser {
  uuid?: string;
  account: string;
  userName: string;
  empno?: string;
  idNumber?: string;
  password?: string;
  rePassword?: string;
  roles: { id: number; role: string; name: string }[];
  groupId: string;
  groupName: string;
  lastLogin?: string;
}

interface IGroup {
  id: number;
  groupName: string;
}

interface IPropersManage<T, H> {
  item?: T; //props中的数据信息
  itemEx?: H; //props中的展示信息
  status?: number;
  fatherUp?: number;
  notify?: (id?: number, param?: any) => void;
  update?: () => void;
}

interface IUIContact {
  contactName: string; //网系名称
  contactId: number; //网系ID号
}

interface IUIDev {
  devName: string; //设备名称
  devUUId: string; //设备UUID
  devStatus: number; //设备状态
  bingCtctId?: number; //绑定网系ID号码
  devIp?: string; //设备IP地址
  libraryVersion?: string; //核心版本
  authorizationFlag?: 0 | 1; //0未注册设备， 1注册设备
}

interface IUserUIData {
  userName?: string; //当前用户名
  userUUid?: string; //用户UUID
  contact?: IUIContact[]; //网系
  devs?: IUIDev[]; //设备
}

//报文信息
interface IUIDatagram {
  bizType?: string;
  createUserName?: string;
  createUserUuid?: string;
  createdAt?: string;
  radioUuid?: string;
  status?: number; // (integer, optional),
  title?: string; // (string, optional),
  type?: string; // (string, optional),
  uuid?: string; // (string, optional)
  //newModel (string, optional),
  //orderStr (string, optional): 排序方式, 如： createdAt desc ,
  //updateUserUuid (string, optional),
  //updatedAt (string, optional),
}

// const waringNotify = (msg: string) => {
//   console.log(msg);
// };

interface ITaskType {
  typeId: number;
  lastLogin?: string;
}

interface IScanImage {
  sysFilesId: string;
  url: string;
  folder: string;
  name: string;
}

interface IFormPages {
  currentPage: number; //请求 第几页
  pageSize: number; // 请求条数
  completeFlag?: number; //完成标志
  radioUuid?: string; // 选择电台
  name?: string;
  contactTableId?: number;
  orderStr?: string; // 选择排序方式
  authorizationFlag?: number;
}

type AppType = "terminal" | "control" | "single";

interface IContentCheckResult {
  result: boolean;
  chars?: string[];
  firstIndex?: number;
}

/** 协商类型，用于收发报时改频处理：
 * check: 请求对方检查通信设备，
 * unilateral: 单方改频，
 * bilateral：双方改频
 */
type ConsultType = "check" | "unilateral" | "bilateral";

/**
 * 请求改频操作
 * （协商信道和协商频率一般二选一， type === "check"时信道和频率都可以不填）
 */
interface ConsultOperation {
  /** 协商类型 */
  type: ConsultType;
  /** 协商信道 */
  channel?: string;
  /** 协商频率 */
  freq?: string;
}

interface ISysCheckLogError {
  id: number;
  radioUuid: string;
  code: string;
  time: string;
}

interface ISysCheckLogStatus {
  id: number;
  radioUuid: string;
  cpuUse: number;
  memUse: number;
  memLen: number;
  diskUse: number;
  diskLen: number;
  devTemp: number;
  dog: string;
  version: string;
  time: string;
}

interface ISysCheckLogPages {
  currentPage: number; //请求 第几页
  pageSize: number; // 请求条数
  radioUuid?: string; // 选择电台
  code: string; //错误代码
  filter?: string;
  orderStr?: string; // 选择排序方式
  startTime?: string;
  endTime?: string;
}

// 日志列表 响应参数
interface ILogList {
  currentPage: number; //当前页
  pageSize: number; // 请求条数
  totalNum: number; // 总条数
  totalPage: number; // 总页数
  items: ILog[]; //分页数据详情
}

interface ILog {
  id?: number;
  type?: string; // (integer, optional): 联络表ID
  userAccountUuid?: string; // (string, optional): 它台电报代号  注：需要获取，网系下的所有ID
  account: string; // 电台id
  radioUuid?: string; // 电台名称
  radioName?: string; // 报文UUID
  status: number; //任务名称
  delFlag: number; // 报文类型：1(发报), 2(收报)
  remark: string; // 业务类型：1(通信检查)
  createUserUuid: string; // 任务类型：1(普通任务), 2(计划任务)
  updateUserUuid?: string; // 附件内容
  createdAt?: string; // 开始时间
  updatedAt?: string; // 完成时间
  orderStr?: string; // (string, optional): 实际开始时间
}

/** 音频来源：PCM流 或 设备(声卡)采样 */
type SoundSource = "pcm" | "device";

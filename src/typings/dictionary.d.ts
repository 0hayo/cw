interface DictionaryItem {
  /** 字典ID */
  uuid: string;
  /** 字典类型(后台定义) */
  type: string;
  /** 显示名称 */
  title: string;
  /** 字典值 */
  value: string;
  /** 排序序号 */
  sort: number;
  /** 有效状态 */
  status: 0 | 1;
  /** 删除标志 */
  delete: 0 | 1;
  /** 详细描述 */
  desc?: string;
}

// /** 工作方式 */
// interface WorkingStyle extends DictionaryItem {
//   type: "work_style";
//   title: "单工" | "双工" | "半双工";
//   value: "0" | "1" | "2";
// }

// /** 工作种类 */
// interface workingKind extends DictionaryItem {
//   type: "work_kind";
//   title: "调幅话" | "上边带" | "下边带" | "等幅报" | "独立边带";
//   value: "am" | "usb" | "lsb" | "cw" | "isb";
// }

// interface DutyMode extends DictionaryItem {
//   type: "duty_mode_flag";
//   title: "是" | "否";
//   value: "Y" | "N";
// }

interface Dictionary {
  [type: string]: DictionaryItem[];
}

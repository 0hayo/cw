interface IForm {
  // /** 当前台站信息 */
  // localStation: MstLocalStation;
  // /**台站下属电台**/
  // radios: MstRadio[];
  // /**消息记录列表**/
  // records: IDatagramRecordVo[];
  /** 当前使用的电台 */
  activeRadio: MstRadio;
  /** 目标通信台站 */
  contactStation: MstStation;
  // /** 工作统计信息 */
  // statistics: {
  //   dataType: string;
  //   sendCount: number;
  //   acceptCount: number;
  // }[];
  datagramType: string;
  // cwReady: boolean;
  cwReady: boolean;
  cwTitle: string;
  cwDevice?: string;
}

export default IForm;

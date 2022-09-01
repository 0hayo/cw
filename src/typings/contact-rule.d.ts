/** 通信规则（联络文件表信道、频率分配）类型定义 */
type MstContactRule = MstChannelGroup[];

interface MstChannelGroup {
  contactListUuid: string;
  primaryFlag: "Z" | "S";
  channelGroup: string;
  contactFreqList: MstChannel[];
}

interface MstChannel {
  uuid: string;
  remark?: string;
  contactListUuid?: string;
  channelCode: string;
  channelGroup: string;
  sendFreq: string;
  sendFreqGroup?: string;
  receiveFreq: string;
  receiveFreqGroup?: string;
}

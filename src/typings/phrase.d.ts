interface McPhrase {
  /** 类型：rx 收报短语 | tx 发报短语 */
  type: "rx" | "tx";
  /** 报文 */
  code: string;
  /** 语意 */
  mean: string;
  /** */
  preset: boolean;
}

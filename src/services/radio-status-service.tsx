const RadioStatusService = {
  /** 存储或获取当前正在操作的电台 */
  current: (radioUuid: string = ""): string => {
    if (radioUuid) {
      localStorage.setItem("CURRENT-RADIO", radioUuid);
      return radioUuid;
    } else {
      return localStorage.getItem("CURRENT-RADIO");
    }
  },
};

export default RadioStatusService;

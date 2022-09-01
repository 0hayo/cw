const NetWorkStatusService = {
  /** 存储或获取当前正在使用的网系 */
  current: (networkUuid: string = ""): string => {
    if (networkUuid) {
      localStorage.setItem("CURRENT-NETWORK", networkUuid);
      return networkUuid;
    } else {
      return localStorage.getItem("CURRENT-NETWORK");
    }
  },
};

export default NetWorkStatusService;

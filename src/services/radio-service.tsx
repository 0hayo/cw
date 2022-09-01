import fetch from "utils/fetch";

/**
 * 电台（终端设备）信息接口服务
 */
const RadioService = {
  /**
   * 获取所有终端设备信息
   * @returns
   */
  getAllRadios: async (): Promise<IRadioItem[]> => {
    const response = await fetch.post<ManageResponse>(
      "/sysRadio/listPage",
      JSON.stringify({
        currentPage: 1,
        pageSize: 100,
      })
    );
    const radios = response.data.data?.items;
    return radios;
  },

  getRadio: async (radioUuid: string): Promise<IRadioItem> => {
    const result = await fetch.get(`sysRadio/get/${radioUuid}`);
    return result.data.data;
  },

  saveRadio: async (radio: IRadioItem): Promise<boolean> => {
    const result = await fetch.put("sysRadio/update", JSON.stringify(radio));
    if (result.data.status === 1) {
      return true;
    }
    return false;
  },

  createRadio: async (radio: IRadioItem): Promise<boolean> => {
    const result = await fetch.post("sysRadio/insert", JSON.stringify(radio));
    if (result.data.status === 1) {
      return true;
    }
    return false;
  },

  deleteRadio: async (uuid: string): Promise<boolean> => {
    fetch.delete(`sysRadio/delete/${uuid}`);
    return true;
  },
};

export default RadioService;

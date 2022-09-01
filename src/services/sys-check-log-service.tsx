import fetch from "utils/fetch";

const SysCheckLogService = {
  listPage: async (page: ISysCheckLogPages): Promise<IPageResult<ISysCheckLogError>> => {
    const response = await fetch.post<ManageResponse>(
      "/sysRadioErrorCode/listPage",
      JSON.stringify(page)
    );
    const result = response.data.data;
    return {
      currentPage: result?.currentPage,
      totalNum: result?.totalNum,
      items: result?.items,
    };
  },

  uploadData: async (
    type: "error" | "status",
    data: ISysCheckLogError[] | ISysCheckLogStatus[]
  ): Promise<boolean> => {
    const url = type === "error" ? "sysRadioErrorCode" : "sysResourceStatus";
    try {
      const response = await fetch.post<ManageResponse>(`/${url}/batch_save`, JSON.stringify(data));
      if (response.data.status === 1) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  },
};

export default SysCheckLogService;

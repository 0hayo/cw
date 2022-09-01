import { external } from "utils/fetch";
import { Dispatch, SetStateAction, useEffect } from "react";

/** 获取当前台站信息 */
const useInit = (setStation: Dispatch<SetStateAction<MstLocalStation>>) => {
  useEffect(() => {
    const wait = external.get<MstResponse>("/station/");
    Promise.resolve(wait).then(response => {
      const result = response.data.data;
      result &&
        setStation({
          uuid: result.uuid,
          name: result.name,
          code: result.code,
          logo: result.logo,
        });
    });
  }, [setStation]);
};

export default useInit;

import { Dispatch, SetStateAction, useEffect, useCallback } from "react";
import message from "misc/message";
import fetch from "utils/fetch";
import { logInfo } from "misc/util";

const useMaskCode = (
  setMaskCodeList: Dispatch<SetStateAction<IMaskCode[]>>,
  setEdit: Dispatch<SetStateAction<boolean>>,
  contactId: number
): {
  save: (maskCodeList: IMaskCode[]) => void;
} => {
  /** 联络文件表变化时，重新加载数据 */
  useEffect(() => {
    if (!contactId) {
      return;
    }
    const wait = fetch.get<ManageResponse>("/sysMaskCode/contact_table/" + contactId);
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) {
        setMaskCodeList(result.data);
      } else message.failure(result.message);
    });
    // eslint-disable-next-line
  }, [contactId]);

  const save = useCallback(
    async (maskCodeList: IMaskCode[]) => {
      try {
        //检查数据合法性
        for (const i in maskCodeList) {
          const code = maskCodeList[i];
          //检测是否有空值
          if (!code.pseudocode || code.pseudocode.trim() === "") {
            message.failure("真伪码设置错误", `真码${code.realCode}的伪码不能为空`);
            return false;
          }

          //检测是否有重复
          const same = maskCodeList.find(
            x => x.pseudocode === code.pseudocode && x.realCode !== code.realCode
          );
          if (same) {
            message.failure(
              "真伪码设置错误",
              `真码${same.realCode}和真码${code.realCode}的伪码重复`
            );
            return false;
          }
        }
        const url = fetch.post<ManageResponse>(
          "/sysMaskCode/batch_save",
          JSON.stringify(maskCodeList)
        );

        const wait = await url;
        Promise.resolve(wait).then(response => {
          const result = response.data;
          if (result.status === 1) {
            logInfo("保存真伪码成功。");
            message.success("保存真伪码成功。");
            setEdit(false);
          } else {
            message.failure("保存真伪码失败", result.message);
          }
        });
      } catch (ex) {
        console.error(ex);
        message.failure("保存真伪码失败", ex.message || ex.toString());
      } finally {
      }
    },
    [setEdit]
  );

  return { save };
};

export default useMaskCode;

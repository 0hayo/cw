import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import message from "misc/message";
import fetch from "utils/fetch";
import { logInfo } from "misc/util";

const useTelegramGrade = (
  setData: Dispatch<SetStateAction<ITelegramGrade[]>>,
  setEdit: Dispatch<SetStateAction<boolean>>,
  contactId: number
): {
  save: (gradeList: ITelegramGrade[]) => void;
} => {
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!contactId) {
      return;
    }
    const wait = fetch.get<ManageResponse>("/sysDatagramGrade/datagram_grade/" + contactId);
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) {
        setData(result.data);
      } else {
        message.failure(result.message);
      }
    });
  }, [contactId, reload, setData]);

  const save = useCallback(
    async (gradeList: ITelegramGrade[]) => {
      try {
        const result = await fetch.post<ManageResponse>(
          "/sysDatagramGrade/batch_save",
          JSON.stringify(gradeList)
        );
        const data = result.data;
        if (data.status === 1) {
          logInfo("保存电报等级代码成功。");
          message.success("保存电报等级代码成功。");
          setEdit(false);
          setReload(reload + 1);
        } else {
          logInfo("保存电报等级代码失败。");
          message.failure("保存电报等级代码失败。");
        }
      } catch (ex) {
        console.error(ex);
        message.failure("保存失败", ex.message || ex.toString());
      } finally {
      }
    },
    [reload, setEdit]
  );

  return { save };
};

export default useTelegramGrade;

import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import message from "misc/message";
import fetch from "utils/fetch";
import { trim } from "lodash";
import { logInfo } from "misc/util";
const useIecCode = (
  setData: Dispatch<SetStateAction<IIecCode[]>>,
  setEdit: Dispatch<SetStateAction<boolean>>,
  contactId: number
): {
  save: (iecCodeTable: IIecCode[][], rows: number, cols: number) => void;
} => {
  useEffect(() => {
    if (!contactId) return;

    const wait = fetch.get<ManageResponse>(`/sysIecCode/contact_table/${contactId}`);
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) {
        const iecListData = result.data || [];
        // iecListData.sort((a, b) => (a.orderNumber > b.orderNumber ? 1 : -1));
        setData(iecListData);
      } else {
        message.failure("查询识别暗令失败", result.message);
      }
    });
  }, [contactId, setData]);

  const save = useCallback(
    async (iecCodeTable: IIecCode[][], rows: number, cols: number) => {
      const saveData: IIecCode[] = [];
      let check = true;
      iecCodeTable.map(row => {
        var i = "";
        if (!check) return null;
        for (i in row) {
          const item = row[i];
          if (!item.code || trim(item.code) === "") {
            check = false;
            message.failure("识别暗令不能为空", `请填写第${item.row}行 第${item.column}列`);
            break;
          }
          saveData.push(item);
        }
        return row;
      });

      if (!check) return;

      try {
        const result = await fetch.post<ManageResponse>(
          `/sysIecCode/batch_save/${rows}/${cols}`,
          JSON.stringify(saveData)
        );
        const data = result.data;
        if (data.status === 1) {
          logInfo("保存识别暗令成功。");
          message.success("保存识别暗令成功。");
          setEdit(false);
        } else {
          logInfo("保存识别暗令失败。");
          message.failure("保存识别暗令失败。");
        }
      } catch (ex) {
        console.error(ex);
        message.failure("保存暗令失败", ex.message || ex.toString());
      } finally {
      }
    },
    [setEdit]
  );

  return { save };
};

export default useIecCode;

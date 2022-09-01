import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import message from "misc/message";
import fetch from "utils/fetch";
import { ITelegramCodeForm } from "./form";
import { logInfo } from "misc/util";

const useTelegramCode = (
  contactId: number,
  form: ITelegramCodeForm,
  setForm: Dispatch<SetStateAction<ITelegramCodeForm>>
): {
  remove: (id: number) => void;
  save: (contactTable: ITelegramCode) => void;
} => {
  useEffect(() => {
    if (!contactId) {
      return;
    }
    const pages = {
      currentPage: 1,
      pageSize: 100,
      contactId: contactId,
    };
    const wait = fetch.post<ManageResponse>("/sysTelegramCode/listPage", JSON.stringify(pages));
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) {
        setForm(x => ({
          ...x,
          telegramCodes: result.data.items,
        }));
      } else {
        setForm(x => ({
          ...x,
          telegramCodes: [],
        }));
        message.failure("查询联络信息失败", result.message);
      }
    });
  }, [form.reload, contactId, setForm]);

  const save = useCallback(
    async (data: ITelegramCode) => {
      try {
        if (!data.telegramCode || data.telegramCode.trim() === "")
          return message.failure("请输入电报代号。");
        if (!data.otherCode || data.otherCode.trim() === "")
          return message.failure("请输入被呼代号。");
        if (!data.ownCode || data.ownCode.trim() === "") return message.failure("请输入自用代号。");

        const response = data.id
          ? await fetch.put<ManageResponse>("/sysTelegramCode/update", JSON.stringify(data))
          : await fetch.post<ManageResponse>("/sysTelegramCode/insert", JSON.stringify(data));
        const result = response.data;
        if (result.status === 1) {
          logInfo("保存电报代号成功。");
          setForm(x => ({
            ...x,
            telegramCodes: [],
            reload: !x.reload,
            add: false,
          }));
          message.success("保存成功。");
        }
      } catch (ex) {
        console.error(ex);
        message.failure("保存失败", ex.message || ex.toString());
      } finally {
      }
    },
    [setForm]
  );

  const remove = useCallback(
    async (id: number) => {
      try {
        const response = await fetch.delete<ManageResponse>(`/sysTelegramCode/delete/${id}`);
        const result = response.data;
        if (result.status === 1) {
          setForm(x => ({
            ...x,
            reload: !x.reload,
          }));
          message.success("删除联络信息表成功。");
        }
      } catch (ex) {
        console.error(ex);
        message.failure("发生错误", ex.message || ex.toString());
      } finally {
      }
    },
    [setForm]
  );

  return { remove, save };
};

export default useTelegramCode;

import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import message from "misc/message";
import fetch from "utils/fetch";

const pages: IFormPages = {
  currentPage: 1,
  pageSize: 100,
};

const useContactTable = (
  form: IContactTableSettingForm,
  setForm: Dispatch<SetStateAction<IContactTableSettingForm>>
): {
  remove: (id: number) => void;
  save: (contactTable: ISysContactTable) => void;
} => {
  // 获取联络表列表数据
  useEffect(() => {
    const wait = fetch.post<ManageResponse>("/sysContactTable/listPage", JSON.stringify(pages));
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1 && result.data?.items) {
        setForm(x => ({
          ...x,
          contactTables: result.data.items,
          activeContactTable: result.data.items[0],
        }));
      } else {
        message.failure(result.message);
      }
    });
  }, [form.reload, setForm]);

  const remove = useCallback(
    async (id: number) => {
      try {
        const response = await fetch.delete<ManageResponse>(`/sysContactTable/delete/${id}`);
        const result = response.data;
        if (result.status === 1) {
          setForm(x => ({
            ...x,
            reload: !x.reload,
          }));
          message.success("删除联络表成功。");
        }
      } catch (ex) {
        console.error(ex);
        message.failure("发生错误", ex.message || ex.toString());
      } finally {
      }
    },
    [setForm]
  );

  const save = useCallback(
    async (contactTable: ISysContactTable) => {
      try {
        if (!contactTable.contactName || contactTable.contactName.trim() === "")
          return message.failure("请输入联络表名称。");

        const response = contactTable.id
          ? await fetch.put<ManageResponse>(
              "/sysContactTable/update",
              JSON.stringify({ contactName: contactTable.contactName, id: contactTable.id })
            )
          : await fetch.post<ManageResponse>(
              "/sysContactTable/insert",
              JSON.stringify({ contactName: contactTable.contactName })
            );
        const result = response.data;
        if (result.status === 1) {
          setForm(x => ({
            ...x,
            reload: !x.reload,
          }));
          message.success("保存联络文件名称成功。");
        }
      } catch (ex) {
        console.error(ex);
        message.failure("保存失败", ex.message || ex.toString());
      } finally {
      }
    },
    [setForm]
  );

  return { remove, save };
};

export default useContactTable;

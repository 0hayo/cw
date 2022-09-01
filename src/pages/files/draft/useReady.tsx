import service from "./service";
import { IForm } from "./typing";
import message from "misc/message";
import { useEffect, Dispatch, SetStateAction } from "react";

const useReady = (form: IForm, setForm: Dispatch<SetStateAction<IForm>>) => {
  useEffect(() => {
    setForm(it => ({
      ...it,
      // folders: [],
      loading: true,
    }));

    (async () => {
      try {
        const result = await service.searchServer(
          form.keyword,
          form.sortord,
          form.radioUuid,
          form.page,
          form.pageSize
        );

        setForm(it => ({
          ...it,
          folders: [...it.folders, ...result.items],
          totalNum: result.totalNum,
          totalPage: result.totalPage,
        }));
      } catch (ex) {
        message.failure("加载数据错误", ex.message || ex.toString());
      } finally {
        setForm(it => ({
          ...it,
          loading: false,
        }));
      }
    })();
  }, [form.keyword, form.sortord, form.page, form.pageSize, form.radioUuid, setForm]);
};

export default useReady;

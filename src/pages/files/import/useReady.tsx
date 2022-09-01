import service from "./service";
import message from "misc/message";
import { IForm } from "./typing";
import { useEffect, Dispatch, SetStateAction } from "react";

const useReady = (form: IForm, setForm: Dispatch<SetStateAction<IForm>>) => {
  // const loadData = useCallback(async () => {
  // try {
  //   setForm(it => ({
  //     ...it,
  //     // folders: [],
  //     loading: true,
  //   }));
  //   // alert(form.radioUuid);
  //   const result = await service.search(
  //     form.keyword,
  //     form.sortord,
  //     form.radioUuid,
  //     form.page,
  //     50,
  //   );
  //   // alert(result.items.length);
  //   setForm(it => ({
  //     ...it,
  //     folders: [...it.folders, ...result.items],
  //     totalNum: result.totalNum,
  //     totalPage: result.totalPage,
  //   }));
  // } catch (ex) {
  //   message.failure("查询导入文件错误", ex.message || ex.toString());
  // } finally {
  //   setForm(it => ({
  //     ...it,
  //     loading: false,
  //   }));
  // }
  // }, [form.keyword, form.sortord, form.page, form.radioUuid, setForm]);

  useEffect(() => {
    console.log("loading data................");
    try {
      setForm(it => ({
        ...it,
        // folders: [],
        loading: true,
      }));
      // alert(form.radioUuid);
      service.search(form.keyword, form.sortord, form.radioUuid, form.page, 50).then(result => {
        setForm(it => ({
          ...it,
          folders: [...it.folders, ...result.items],
          totalNum: result.totalNum,
          totalPage: result.totalPage,
          loading: false,
        }));
      });
      // alert(result.items.length);
    } catch (ex) {
      message.failure("查询导入文件错误", ex.message || ex.toString());
    } finally {
      // setForm(it => ({
      //   ...it,
      //   loading: false,
      // }));
    }
  }, [form.keyword, form.sortord, form.page, form.radioUuid, setForm]);

  // return loadData;
};

export default useReady;

import qs from "query-string";
import { IForm } from "./typing";
import message from "misc/message";
import guid from "misc/guid";
import { useLocation } from "react-router";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import fetch from "utils/fetch";
import { bizServerAPIPath } from "misc/env";
import moment from "moment";

const useInit = (type: TelegramBizType | undefined, setForm: Dispatch<SetStateAction<IForm>>) => {
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);

  //上传文件记录ID
  const sysFilesId = search.sysFilesId as string;
  const mode = search.mode as string;

  useEffect(() => {
    setForm(x => ({
      ...x,
      type,
      head: { ...x.head, DATE: { value: moment().format("MMDD") } },
      saved: true,
    }));
  }, [type, setForm]);

  useEffect(() => {
    if (sysFilesId) {
      (async () => {
        try {
          //从业务服务器加载上传图片数据
          const result = await fetch.get(`/sysFiles/get/${sysFilesId}`);
          const { data } = result;
          const fileDir = data?.fileDir;
          const fileNames = data?.fileNames ? JSON.parse(data.fileNames) : [];
          const meta = data?.remark ? JSON.parse(data.remark) : {};

          const folderUrl = `${bizServerAPIPath}/files/import/${fileDir}`;
          const images: IScanImage[] = [];
          fileNames.map(x => {
            console.log("-------", `${folderUrl}/${x}`);
            images.push({
              sysFilesId: sysFilesId,
              url: `${folderUrl}/${x}`,
              folder: fileDir,
              name: x,
            });
            return x;
          });
          setForm(it => ({
            ...it,
            images,
            imgdir: folderUrl,
            sysFilesId: sysFilesId,
            // type: meta.type ? meta.type : undefined,
            name: meta.name,
            dir: fileDir,
            saved: true,
            mode: mode === "PIC" ? "PIC" : mode === "DOC" ? "DOC" : undefined,
          }));
        } catch (ex) {
          message.failure("发生错误", ex.message || ex.toString());
        }
      })();
    } else {
      const fileDir = guid();
      const imgdir = `${bizServerAPIPath}/files/import/${fileDir}`;

      setForm(x => ({
        ...x,
        saved: true,
        imgdir,
        dir: fileDir,
      }));
    }
  }, [sysFilesId, mode, setForm]);
};

export default useInit;

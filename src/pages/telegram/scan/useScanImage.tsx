import useMounted from "hooks/useMounted";
import { aiServerHttpPort, bizServerAddress, bizServerAPIPath, LOCAL_MACHINE_ID } from "misc/env";
import message from "misc/message";
import { max } from "misc/telegram";
import moment from "moment";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import fetch, { outer } from "utils/fetch";
import { IForm } from "./typing";

const useScanImage = (
  setForm: Dispatch<SetStateAction<IForm>>
): [
  (image: IScanImage, form: IForm) => void,
  (image: IScanImage, form: IForm) => void,
  (image: IScanImage, form: IForm) => void,
  boolean
] => {
  const [loading, setLoading] = useState(false);
  const mounted = useMounted();

  const add = useCallback(
    async (image: IScanImage, form: IForm) => {
      const fileNames: string[] = [];
      const rawDatas: string[] = [];
      form.images.map(it => {
        fileNames.push(it.name);
        if (it.url.startsWith("data:")) {
          rawDatas.push(it.url.replace("data:image/png;base64,", ""));
        } else {
          rawDatas.push("");
        }
        return it;
      });
      fileNames.push(image.name);
      rawDatas.push(image.url.replace("data:image/png;base64,", ""));

      //上传新拍摄的图片
      const reqData = {
        id: form.sysFilesId,
        fileDir: form.dir,
        fileNames: JSON.stringify(fileNames),
        rawDatas,
        newModel: "I",
        radioUuid: LOCAL_MACHINE_ID,
      };
      if (!form.sysFilesId) {
        const folderName = "扫描导入 " + moment().format("YYYYMMDDHHmmss");
        const meta = { name: folderName, date: new Date().toISOString(), mode: "PIC" };
        reqData["folderName"] = folderName;
        reqData["remark"] = JSON.stringify(meta);
      }
      const result = await fetch.post("/sysFiles/upload", JSON.stringify(reqData));
      const { data } = result.data;
      console.log("upload file , return data = ", data);
      image.sysFilesId = form.sysFilesId;
      image.folder = form.dir;
      image.url = `${bizServerAPIPath}/files/import/${form.dir}/${image.name}`;
      const sysFilesId = data?.id ? data.id : null;
      image.sysFilesId = sysFilesId;
      const images = [...form.images, image];

      mounted.current &&
        setForm(x => ({
          ...x,
          images,
          sysFilesId: sysFilesId,
        }));
    },
    [mounted, setForm]
  );

  const drop = useCallback(
    async (image: IScanImage, form: IForm) => {
      console.log("drop image:", image);
      const fileNames: string[] = [];
      const rawDatas: string[] = [];
      const images = form.images.filter(x => x.name !== image.name);
      images.map(it => {
        fileNames.push(it.name);
        rawDatas.push("");
        return it;
      });
      //通过上传接口更新数据
      const reqData = {
        id: form.sysFilesId,
        fileNames: JSON.stringify(fileNames),
        rawDatas,
      };
      await fetch.post("/sysFiles/upload", JSON.stringify(reqData));
      setForm(x => ({
        ...x,
        images,
      }));
    },
    [setForm]
  );

  const ocr = useCallback(
    async (image: IScanImage, form: IForm) => {
      if (!mounted.current) return;
      setLoading(true);
      const reqAction =
        image.name.endsWith(".docx") || image.name.endsWith(".DOCX") ? "ocr" : "newocr";
      const reqType = image.name.endsWith(".docx") || image.name.endsWith(".DOCX") ? "doc" : "work";
      const reqUrl = `http://${bizServerAddress}:${aiServerHttpPort}/${reqAction}?file=${image.folder}/${image.name}&type=${reqType}`;
      try {
        const result = await outer.get(reqUrl);

        if (result.status !== 200) {
          message.failure("智能识报", "无法识别电文");
          return;
        }
        if (reqType === "doc") {
          //DOC文档识别
          setForm(x => {
            const mx = max(x.body);
            const data: McTelegramHash = { ...x.body };
            const body: string[] = result.data?.data?.body;

            body.forEach((it, ix) => {
              data[mx + ix + 1] = {
                crude: it,
                value: it,
              };
            });
            // alert(data[0].image);
            const size = Math.ceil(max(data) + 1);
            const page = Math.ceil(size / 100);
            return {
              ...x,
              page: page,
              body: data,
              size: Math.ceil(max(data) + 1),
              saved: false,
            };
          });
        } else {
          //扫描图片识别

          setForm(x => {
            const mx = max(x.body);
            const data: McTelegramHash = { ...x.body };
            const body: { code: string }[] = result.data?.data?.body;
            const ceilDir = result.data?.img_dir; //识别切片图片所在文件夹
            const ceilBaseUrl = `http://${bizServerAddress}:${aiServerHttpPort}/image/${ceilDir}`;
            body &&
              body.forEach((it, ix) => {
                data[mx + ix + 1] = {
                  crude: it.code,
                  value: it.code,
                  image: `${ceilBaseUrl}/ceil_${ix}.png`,
                };
              });
            const size = Math.ceil(max(data) + 1);
            const page = Math.ceil(size / 100);
            return {
              ...x,
              page: page,
              body: data,
              size: Math.ceil(max(data) + 1),
              saved: false,
            };
          });
        }
      } catch (ex) {
        message.failure("识别失败", ex.message || ex.toString());
      } finally {
        setLoading(false);
      }
    },
    [mounted, setForm]
  );

  return [add, drop, ocr, loading];
};

export default useScanImage;

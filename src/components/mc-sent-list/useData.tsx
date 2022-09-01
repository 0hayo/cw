import fetch from "utils/fetch";
import { Dispatch, SetStateAction, useEffect } from "react";
import { IFormSentPages } from "./types";
import xmeta from "services/xmeta";

/** 获取已发报文列表 */
const UseData = (
  telegram: IPageResult<McTelegramMeta>,
  pages: IFormSentPages,
  setTelegram: Dispatch<SetStateAction<IPageResult<McTelegramMeta>>>,
  reload: boolean
) => {
  // 获取已发报文
  useEffect(() => {
    fetch
      .post<ManageResponse>("/sysTaskDatagramRelation/listPage", JSON.stringify(pages))
      .then(async response => {
        const data = response.data?.data;
        const folders = data?.items;

        const telegramList: McTelegramMeta[] = [];
        const waits =
          folders &&
          folders.map(async it => {
            const meta: McTelegramMeta = await xmeta.readServer(it.datagramUuid);
            meta.datagramUuid = it.datagramUuid;
            meta.taskId = it.taskId;
            meta.stime = it.createdAt;
            meta.name = it.datagramTitle;
            telegramList.push(meta);
          });
        await Promise.all(waits);

        if (telegramList) {
          telegramList.sort((a, b) => {
            if (a.stime > b.stime) {
              return -1;
            } else {
              return 1;
            }
          });
        }

        setTelegram(x => ({
          ...x,
          totalPage: data?.totalPage,
          items: telegramList,
        }));
      });
  }, [pages, reload, setTelegram]);
};

export default UseData;

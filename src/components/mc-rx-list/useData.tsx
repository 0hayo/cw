import fetch from "utils/fetch";
import { Dispatch, SetStateAction, useEffect } from "react";
import { IFormRxPages } from "./types";
import xmeta from "services/xmeta";
import moment from "moment";

/** 获取已收报文列表 */
const UseData = (
  telegram: IPageResult<McTelegramMeta>,
  pages: IFormRxPages,
  setTelegram: Dispatch<SetStateAction<IPageResult<McTelegramMeta>>>,
  reload: boolean
) => {
  // 获取已收报文
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
            meta.name = it.datagramTitle;
            meta.stime = it.createdAt;
            telegramList.push(meta);
          });
        await Promise.all(waits);

        if (telegramList) {
          telegramList.sort((a, b) => {
            if (moment(a.stime).isAfter(moment(b.stime))) {
              // if (a.stime > b.stime) {
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

  // const getMeta = async (data) : McTelegram  =>
};

export default UseData;

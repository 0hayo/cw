import fs from "fs";
import path from "path";
import util from "util";
import xmeta from "services/xmeta";
import { kWorkFiles } from "misc/env";
import fetch from "utils/fetch";

const service = {
  search: async (
    keyword: string,
    sortord: "stime" | "name",
    type: string
  ): Promise<McTelegramStat[]> => {
    const dir = path.join(kWorkFiles, type);

    if (fs.existsSync(dir)) {
      const files = await util.promisify(fs.readdir)(dir);
      const waits = files.map(async it => {
        const meta = await xmeta.read(path.join(dir, it));
        return {
          ...meta,
          path: path.join(dir, it),
        } as McTelegramStat;
      });
      const stats = await Promise.all(waits);
      return stats
        .filter(x => x.name?.indexOf(keyword) !== -1)
        .sort((a, b) => (a[sortord] > b[sortord] ? -1 : 1));
    }

    return [];
  },
  searchServer: async (
    keyword: string,
    sortord: "stime" | "name",
    radioUuid: string,
    type: string,
    page: number = 1,
    size: number = 10
  ): Promise<IPageResult<McTelegramStat>> => {
    const sort = sortord === "stime" ? "created_at desc" : "datagram_title desc";
    // const { data } = await fetch.get<ManageResponse>(
    //   "/sysTaskDatagramRelation/list?type=" +
    //     type +
    //     "&datagramTitle=" +
    //     keyword +
    //     "&orderStr=" +
    //     sortString
    // );

    const result = await fetch.post(
      "/sysTaskDatagramRelation/listPage",
      JSON.stringify({
        datagramTitle: keyword,
        orderStr: sort,
        radioUuid,
        completeFlag: 1,
        type: type,
        currentPage: page,
        pageSize: size,
      })
    );

    const data = result.data?.data;
    const folders = data?.items;

    // const items: McFolderMeta[] = [];
    // Promise.resolve(wait).then(response => {
    //   const result = response.data;
    let telegramList = [];
    // if (data.status === 1)

    // {
    if (folders) {
      const waits = folders.map(async it => {
        const _meta = await xmeta.readServer(it.datagramUuid);
        const meta: McTelegramStat = {
          from: "send",
          type: _meta.type ? _meta.type : "CW",
          state: it.state,
          name: it.datagramTitle,
          stime: it.updatedAt,
          // stime: it.createdAt,
          ptime: it.createdAt,
          path: it.datagramUuid,
          taskId: it.taskId,
        };
        // alert(it.datagramTitle+"xxx");
        // console.log("data=",it);
        // console.log("data2=",meta);
        telegramList.push(meta);
        // return {
        //   ...meta as McTelegramMeta,
        //   path: it.uuid,
        // };
      });
      await Promise.all(waits);
    }

    // const stats = await Promise.all(waits);
    telegramList &&
      telegramList.sort((a, b) => {
        if (sortord === "name") {
          if (a.name > b.name) {
            return 1;
          } else {
            return -1;
          }
        } else {
          if (a.stime > b.stime) {
            return -1;
          } else {
            return 1;
          }
        }
      });
    console.log("telegramlist:", telegramList);
    // return telegramList;
    // .filter(x => x.name.indexOf(keyword) !== -1)
    // .sort((a, b) => (a[sortord] > b[sortord] ? -1 : 1));
    // }

    return {
      currentPage: data?.currentPage,
      pageSize: data?.pageSize,
      totalNum: data?.totalNum,
      totalPage: data?.totalPage,
      items: telegramList,
    };
  },
};

export default service;

import fs from "fs";
import path from "path";
import util from "util";
import xmeta from "services/xmeta";
import { kWorkFiles } from "misc/env";
import fetch from "utils/fetch";

const service = {
  search: async (keyword: string, sortord: "stime" | "name"): Promise<McTelegramStat[]> => {
    const dir = path.join(kWorkFiles, "draft");

    if (fs.existsSync(dir)) {
      const files = await util.promisify(fs.readdir)(dir);
      const waits = files.map(async it => {
        const meta = await xmeta.read(path.join(dir, it));
        return {
          ...meta,
          path: path.join(dir, it),
        };
      });
      const stats = await Promise.all(waits);
      return stats
        .filter(x => x.name.indexOf(keyword) !== -1)
        .sort((a, b) => (a[sortord] > b[sortord] ? -1 : 1));
    }

    return [];
  },
  searchServer: async (
    keyword: string,
    sortord: "stime" | "name",
    radioUuid: string,
    page: number = 1,
    size: number = 50
  ): Promise<IPageResult<McTelegramStat>> => {
    const sortString = sortord === "stime" ? "updated_at desc" : "title asc";
    const result = await fetch.post<ManageResponse>(
      "/sysDatagram/listPage",
      JSON.stringify({
        title: keyword,
        radioUuid,
        orderStr: sortString,
        currentPage: page,
        pageSize: size,
        delFlag: 0,
      })
    );
    const data = result.data?.data;
    // Promise.resolve(wait).then(response => {
    //   const result = response.data;
    let telegramList = [];
    if (result.data.status === 1) {
      const waits = data.items?.map(async it => {
        const _meta = await xmeta.readServer(it.uuid);
        const meta = {
          from: "send",
          type: _meta.type,
          name: it.title,
          stime: it.updatedAt,
          ptime: it.createdAt,
          path: it.uuid,
        };
        telegramList.push(meta);

        // console.log("data=",it);
        // console.log("data2=",meta);
        // return {
        //   ...meta as McTelegramMeta,
        //   path: it.uuid,
        // };
      });

      // const stats = await Promise.all(waits);
      // console.log("telegramlist:", telegramList);
      await Promise.all(waits);

      telegramList.sort((a, b) => {
        if (sortord === "stime") {
          console.log("sort by stime");
          if (a.stime > b.stime) {
            return -1;
          } else {
            return 1;
          }
        } else {
          if (a.name > b.name) {
            return 1;
          } else {
            return -1;
          }
        }
      });
      return {
        currentPage: data?.currentPage,
        pageSize: data?.pageSize,
        totalNum: data?.totalNum,
        totalPage: data?.totalPage,
        items: telegramList,
      };
      // .filter(x => x.name.indexOf(keyword) !== -1)
      // .sort((a, b) => (a[sortord] > b[sortord] ? -1 : 1));
    }
  },
};

export default service;

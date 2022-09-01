import fs from "fs";
import path from "path";
import util from "util";
import fse from "misc/fse";
import fetch from "utils/fetch";
import guid from "misc/guid";
const xmeta = {
  read: async (dir: string): Promise<McTelegramMeta> => {
    const meta = await fse.json(path.join(dir, "meta.json"));
    return {
      ...meta,
    } as McTelegramMeta;
  },

  readServer: async (dir: string): Promise<McTelegramMeta> => {
    const { data } = await fetch.get<MstResponse>(`/sysDatagramAttachment/${dir}/meta`);
    // console.log("dataResponse", data);
    if (data.data?.content) {
      const json = JSON.parse(data.data.content);
      // return {
      //   ...json,
      // } as McTelegramMeta;
      return json as McTelegramMeta;
    }
  },

  save: async (dir: string, meta: Partial<McTelegramMeta>): Promise<void> => {
    const dst = path.join(dir, "meta.json");
    if (fs.existsSync(dst)) {
      const json = await xmeta.read(dir);
      await util.promisify(fs.writeFile)(
        dst,
        JSON.stringify({
          ...json,
          ...meta,
        })
      );
    } else {
      await util.promisify(fs.writeFile)(dst, JSON.stringify(meta));
    }
  },
  saveServer: async (dir: string, meta: Partial<McTelegramMeta>): Promise<void> => {
    let { data } = await fetch.get<MstResponse>(`/sysDatagramAttachment/${dir}/meta`);
    console.log("dataResponse", data);
    if (data.data?.content) {
      const json = JSON.parse(data.data.content);
      const postParam = {
        content: JSON.stringify({
          ...json,
          ...meta,
        }),
        datagramUuid: dir,
        type: "meta",
      };
      console.log("updatedata=", postParam);
      await fetch.put<MstResponse>("/sysDatagramAttachment/", JSON.stringify(postParam));
    } else {
      const postParam = {
        content: JSON.stringify(meta),
        datagramUuid: dir,
        type: "meta",
        uuid: guid(),
      };
      console.log("postdata=", postParam);
      await fetch.post<MstResponse>("/sysDatagramAttachment/", JSON.stringify(postParam));
    }
  },
};

export default xmeta;

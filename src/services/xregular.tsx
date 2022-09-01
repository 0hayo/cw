import fs from "fs";
import path from "path";
import util from "util";
import fse from "misc/fse";
import fetch from "utils/fetch";
import guid from "misc/guid";

const xregular = {
  read: async (dir: string): Promise<McTelegram> => {
    const code = await fse.json(path.join(dir, "regular.json"));
    return code as McTelegram;
  },
  readServer: async (dir: string): Promise<McTelegram> => {
    const { data } = await fetch.get<MstResponse>(`/sysDatagramAttachment/${dir}/regular`);
    console.log("dataResponse", data);
    if (data.data?.content) {
      const json = JSON.parse(data.data.content);
      return json as McTelegram;
    }
  },
  save: async (dir: string, telegram: McTelegram): Promise<void> => {
    await util.promisify(fs.writeFile)(path.join(dir, "regular.json"), JSON.stringify(telegram));
  },
  saveServer: async (dir: string, telegram: McTelegram): Promise<void> => {
    let { data } = await fetch.get<MstResponse>(`/sysDatagramAttachment/${dir}/regular`);
    console.log("dataResponse", data);
    if (data.data?.content) {
      const postParam = {
        content: JSON.stringify(telegram),
        datagramUuid: dir,
        type: "regular",
      };
      console.log("updatedata=", postParam);
      await fetch.put<MstResponse>("/sysDatagramAttachment/", JSON.stringify(postParam));
    } else {
      const postParam = {
        content: JSON.stringify(telegram),
        datagramUuid: dir,
        type: "regular",
        uuid: guid(),
      };
      console.log("postdata=", postParam);
      await fetch.post<MstResponse>("/sysDatagramAttachment/", JSON.stringify(postParam));
    }
  },
};

export default xregular;

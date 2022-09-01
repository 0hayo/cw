import fs from "fs";
import path from "path";
import util from "util";
import fse from "misc/fse";
import fetch from "utils/fetch";
import guid from "misc/guid";
const xcopy = {
  read: async (dir: string): Promise<McTelegramCopy | undefined> => {
    const dst = path.join(dir, "copy.json");
    if (fs.existsSync(dst)) {
      const data = await fse.json(dst);
      return data as McTelegramCopy;
    }
  },
  readServer: async (dir: string): Promise<McTelegramCopy | undefined> => {
    const { data } = await fetch.get<MstResponse>(`/sysDatagramAttachment/${dir}/copy`);
    console.log("dataResponse", data);
    if (data.data?.content) {
      const json = JSON.parse(data.data.content);
      return json as McTelegramCopy;
    }
  },
  save: async (dir: string, data: McTelegramCopy): Promise<void> => {
    const dst = path.join(dir, "copy.json");
    await util.promisify(fs.writeFile)(dst, JSON.stringify(data));
  },
  saveServer: async (dir: string, dataCopy: McTelegramCopy): Promise<void> => {
    let { data } = await fetch.get<MstResponse>(`/sysDatagramAttachment/${dir}/copy`);
    console.log("dataResponse", data);
    if (data.data?.content) {
      const postParam = {
        content: JSON.stringify(dataCopy),
        datagramUuid: dir,
        type: "copy",
      };
      console.log("updatedata=", postParam);
      await fetch.put<MstResponse>("/sysDatagramAttachment/", JSON.stringify(postParam));
    } else {
      const postParam = {
        content: JSON.stringify(dataCopy),
        datagramUuid: dir,
        type: "copy",
        uuid: guid(),
      };
      console.log("postdata=", postParam);
      await fetch.post<MstResponse>("/sysDatagramAttachment/", JSON.stringify(postParam));
    }
  },
};

export default xcopy;

import fs from "fs";
import path from "path";
import util from "util";
import fse from "misc/fse";
import fetch from "utils/fetch";
import guid from "misc/guid";

const xchat = {
  read: async (dir: string): Promise<Message[]> => {
    const chat = path.join(dir, "chat.json");
    if (fs.existsSync(chat)) {
      const json = await fse.json(path.join(dir, "chat.json"));
      return json as Message[];
    }
    return [];
  },
  readServer: async (dir: string): Promise<Message[]> => {
    console.log("uuid........chat", dir);
    const { data } = await fetch.get<MstResponse>(`/sysDatagramAttachment/${dir}/chat`);
    console.log("dataResponse", data);
    if (data.data?.content) {
      const json = JSON.parse(data.data.content);
      console.log("dataResponse", json);
      return json as Message[];
    }

    return [];
  },
  save: async (dir: string, messages: Message[]): Promise<void> => {
    await util.promisify(fs.writeFile)(path.join(dir, "chat.json"), JSON.stringify(messages));
  },
  saveServer: async (dir: string, messages: Message[]): Promise<void> => {
    console.log("uuid", dir);
    // let data;
    let { data } = await fetch.get<MstResponse>(`/sysDatagramAttachment/${dir}/chat`);
    console.log("dataResponse", data);
    if (data.data?.content) {
      const postParam = {
        content: JSON.stringify(messages),
        datagramUuid: dir,
        type: "chat",
      };
      console.log("updatedata=", postParam);
      await fetch.put<MstResponse>("/sysDatagramAttachment/", JSON.stringify(postParam));
    } else {
      const postParam = {
        content: JSON.stringify(messages),
        datagramUuid: dir,
        type: "chat",
        uuid: guid(),
      };
      console.log("postdata=", postParam);
      await fetch.post<MstResponse>("/sysDatagramAttachment/", JSON.stringify(postParam));
    }
  },
};

export default xchat;

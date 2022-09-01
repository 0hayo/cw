import fs from "fs";
import path from "path";
import util from "util";
import fse from "misc/fse";
import fetch from "utils/fetch";
import guid from "misc/guid";

const xsession = {
  read: async (dir: string): Promise<McSession | undefined> => {
    const dst = path.join(dir, "session.json");
    if (fs.existsSync(dst)) {
      const data = await fse.json(dst);
      if (fs.existsSync(data.path)) {
        return { ...data, exists: true } as McSession;
      } else {
        return { ...data, exists: false } as McSession;
      }
    }
  },
  readServer: async (dir: string): Promise<McSession | undefined> => {
    console.log("uuid", dir);
    const { data } = await fetch.get<MstResponse>(`/sysDatagramAttachment/${dir}/session`);
    console.log("dataResponse", data);
    if (data.data?.content) {
      const json = JSON.parse(data.data.content);
      if (json.path) {
        return { ...json, exists: true } as McSession;
      }
    }
    // else
    // {
    //   const json = { };
    //   return { ...json, exists: false } as McSession;
    // }

    // const dst = path.join(dir, "session.json");
    // if (fs.existsSync(dst)) {
    //   const data = await fse.json(dst);
    //   if (fs.existsSync(data.path)) {
    //     return { ...data, exists: true } as McSession;
    //   } else {
    //     return { ...data, exists: false } as McSession;
    //   }
    // }
  },
  save: async (dir: string, data: Partial<McSession>): Promise<void> => {
    const dst = path.join(dir, "session.json");
    if (fs.existsSync(dst)) {
      const json = await xsession.read(dir);
      await util.promisify(fs.writeFile)(
        dst,
        JSON.stringify({
          ...json,
          ...data,
        })
      );
    } else {
      await util.promisify(fs.writeFile)(dst, JSON.stringify(data));
    }
  },
  saveServer: async (dir: string, dataSession: Partial<McSession>): Promise<void> => {
    console.log("uuid", dir);
    // let data;
    let { data } = await fetch.get<MstResponse>(`/sysDatagramAttachment/${dir}/session`);
    console.log("dataResponse", data);
    if (data.data?.content) {
      const json = JSON.parse(data.data.content);
      const postParam = {
        content: JSON.stringify({
          ...json,
          ...dataSession,
        }),
        datagramUuid: dir,
        type: "session",
      };
      console.log("updatedata=", postParam);
      await fetch.put<MstResponse>("/sysDatagramAttachment/", JSON.stringify(postParam));
      console.log("updatedata=", data);
    } else {
      const postParam = {
        content: JSON.stringify(dataSession),
        datagramUuid: dir,
        type: "session",
        uuid: guid(),
      };
      console.log("postdata=", postParam);
      await fetch.post<MstResponse>("/sysDatagramAttachment/", JSON.stringify(postParam));
    }
  },
};

export default xsession;

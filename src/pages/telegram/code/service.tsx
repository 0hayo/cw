import path from "path";
import fse from "misc/fse";
import guid from "misc/guid";
import xcode from "services/xcode";
import xmeta from "services/xmeta";
import { kWorkFiles } from "misc/env";
import xdatagram from "services/xdatagram";

interface IProps {
  dir?: string;
  type: TelegramBizType;
  name: string;
  stime: string;
  ptime: string;
  head: McTelegramHash;
  body: McTelegramHash;
}

const service = {
  save: async ({ dir, type, head, body, name, stime, ptime }: IProps): Promise<string> => {
    const dst = dir ? dir : path.join(kWorkFiles, "draft", guid());
    await fse.ensure(dst);
    await xcode.save(dst, { head, body });
    await xmeta.save(dst, {
      from: "code",
      type,
      name,
      stime,
      ptime,
    });
    return dst;
  },
  saveServer: async ({ dir, type, head, body, name, stime, ptime }: IProps): Promise<string> => {
    // const uuid = guid();
    // const dst = dir ? dir : path.join(kWorkFiles, "draft", uuid);
    // await fse.ensure(dst);
    // alert(2);
    const dst = dir ? dir : guid();
    if (dir) {
      // alert("update");
      await xcode.updateServer(dst, { head, body });
      await xdatagram.updateServer(dst, "10001", name, 1, "M", 0);
    } else {
      // alert("save");
      //先保存报文
      await xdatagram.saveServer(dst, "10001", name, 1, false, "none", "M", 0);
      //再保存附件
      await xcode.saveServer(dst, { head, body });
    }
    await xmeta.saveServer(dst, {
      from: "code",
      type,
      name,
      stime,
      ptime,
    });

    return dst;
  },
};

export default service;

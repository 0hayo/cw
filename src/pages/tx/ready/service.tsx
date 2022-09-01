import path from "path";
import fse from "misc/fse";
import guid from "misc/guid";
import xcode from "services/xcode";
import xmeta from "services/xmeta";
import { kWorkFiles } from "misc/env";
import cwIForm from "pages/cw/form";
interface IProps {
  dir?: string;
  type: TelegramBizType;
  name: string;
  stime: string;
  ptime: string;
  head: McTelegramHash;
  body: McTelegramHash;
  finish?: boolean;
  cwForm?: cwIForm;
}

const service = {
  save: async ({
    dir,
    type,
    head,
    body,
    name,
    stime,
    ptime,
    finish = false,
  }: IProps): Promise<string> => {
    const dst = dir ? dir : path.join(kWorkFiles, "draft", guid());
    await fse.ensure(dst);
    await xcode.save(dst, { head, body });
    await xmeta.save(dst, {
      from: "code",
      type,
      name,
      stime,
      ptime,
      finish,
    });
    return dst;
  },
  saveServer: async ({
    dir,
    type,
    head,
    body,
    name,
    stime,
    ptime,
    finish = false,
    cwForm,
  }: IProps): Promise<string> => {
    // const uuid = guid();
    // const dst = dir ? dir : path.join(kWorkFiles, "draft", uuid);
    // await fse.ensure(dst);
    // alert(2);
    const dst = dir ? dir : guid();

    // alert("save");
    // await xcode.saveRecordServer(
    await xcode.saveServer(dst, { head, body });
    await xmeta.saveServer(dst, {
      from: "code",
      type,
      name,
      stime,
      ptime,
      finish,
    });

    return dst;
  },
};

export default service;

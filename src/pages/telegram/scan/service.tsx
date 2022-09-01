import guid from "misc/guid";
import xmeta from "services/xmeta";
import xcode from "services/xcode";
import xdatagram from "services/xdatagram";
import { LOCAL_MACHINE_ID as radioUuid } from "misc/env";

interface IProps {
  telegramUuid: string;
  dir?: string;
  type: TelegramBizType | undefined;
  name: string;
  stime: string;
  ptime: string;
  head: McTelegramHash;
  body: McTelegramHash;
  imgdir: string;
  mode: string;
  sysFilesId: string;
}

// const PIC_TYPES = [".jpg", ".jpeg", ".png"];
// const DOC_TYPES = [".docx", ".doc", ".pdf"];

// const getMode = (extname: string): "PIC" | "DOC" | "?" => {
//   const name = extname ? extname.toLowerCase() : "?";
//   if (PIC_TYPES.indexOf(name) >= 0) {
//     return "PIC";
//   }
//   if (DOC_TYPES.indexOf(name) >= 0) {
//     return "DOC";
//   }
//   return "?";
// };

const service = {
  saveServer: async ({
    telegramUuid,
    dir,
    type,
    head,
    body,
    name,
    stime,
    ptime,
    imgdir,
    mode,
    sysFilesId,
  }: IProps): Promise<string> => {
    const dst = telegramUuid ? telegramUuid : guid();
    if (telegramUuid) {
      await xcode.updateServer(dst, { head, body });
    } else {
      await xdatagram.saveServer(dst, radioUuid, name, 1, false, "none", "S", 0);
      //再保存附件
      await xcode.saveServer(dst, { head, body });
    }
    await xmeta.saveServer(dst, {
      from: "scan",
      type,
      name,
      stime,
      ptime,
      imgdir: imgdir,
      mode: mode === "DOC" ? "DOC" : "PIC",
      sysFileId: sysFilesId,
    });

    return dst;
  },
};

export default service;

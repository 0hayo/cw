import fs from "fs";
import path from "path";
import util from "util";
import xmeta from "services/xmeta";
import { kWorkFiles } from "misc/env";

const service = {
  list: async (): Promise<McTelegramStat[]> => {
    const dir = path.join(kWorkFiles, "draft");

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
      return stats.sort((a, b) => (a["ptime"] < b["ptime"] ? 1 : -1));
    }

    return [];
  },
};

export default service;

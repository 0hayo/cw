import fs from "fs";
import path from "path";
import util from "util";
import fse from "misc/fse";
import rimraf from "rimraf";
import guid from "misc/guid";
import { kWorkFiles } from "misc/env";

const PIC_TYPES = [".jpg", ".jpeg", ".png"];
const DOC_TYPES = [".docx", ".doc", ".pdf"];

const getMode = (extname: string): "PIC" | "DOC" | "?" => {
  const name = extname.toLowerCase();
  if (PIC_TYPES.indexOf(name) >= 0) {
    return "PIC";
  }
  if (DOC_TYPES.indexOf(name) >= 0) {
    return "DOC";
  }
  return "?";
};

const service = {
  delete: (path: string) => {
    if (fs.existsSync(path)) {
      rimraf.sync(path);
    }
  },
  upload: async (name: string, files: File[]): Promise<McFolderMeta> => {
    const dir = path.join(kWorkFiles, "import", guid());
    fs.mkdirSync(dir, { recursive: true });
    const paths = Array<string>();
    const waits = files.map(it => {
      const src = (it as any).path;
      const dst = path.join(dir, guid() + path.extname(it.name));
      paths.push(dst);
      return util.promisify(fs.copyFile)(src, dst);
    });

    await Promise.all(waits);

    //如果传入的是doc或docx文件，则调用unoconv将文件转换为PDF格式（UI预览文档为转换后的PDF文件）
    const extname = path.extname(paths[0]).toLowerCase();
    const mode = getMode(extname);
    // path不能存进meta文件
    const meta = {
      id: "",
      name,
      date: new Date().toISOString(),
      mode: mode,
    };

    fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta));
    if (extname === ".docx" || extname === ".doc") {
      const execFile = require("child_process").execFile;
      let cmd = "unoconv";

      execFile(cmd, paths, [], (error: Error, stdout: string, stderr: string) => {
        if (error) {
          console.error("error: " + error);
          return;
        }
      });
    }

    return {
      ...meta,
      path: dir,
    };
  },
  meta: async (dir: string): Promise<McFolderMeta> => {
    const json = await fse.json(path.join(dir, "meta.json"));

    return {
      id: "",
      path: dir,
      name: json.name,
      date: json.date,
      mode: json.mode,
      type: json.type,
    };
  },
  search: async (keyword: string, sortord: "date" | "name"): Promise<McFolderMeta[]> => {
    const dir = path.join(kWorkFiles, "import");

    if (fs.existsSync(dir)) {
      const files = await util.promisify(fs.readdir)(dir);
      const waits = files.map(async it => await service.meta(path.join(dir, it)));
      const metas = await Promise.all(waits);
      return metas
        .filter(x => x.name?.indexOf(keyword) !== -1)
        .sort((a, b) => (a[sortord] > b[sortord] ? -1 : 1));
    }

    return [];
  },
};

export default service;

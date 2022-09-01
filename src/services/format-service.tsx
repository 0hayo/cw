import fs from "fs";
import path from "path";
import moment from "moment";
import util from "util";
import _ from "lodash";
import { remote } from "electron";
import { kWorkFiles } from "misc/env";
import fse from "misc/fse";

const McFormatService = {
  /** 设置指定的报文格式模板为默认的模板 */
  setDefault: async (name: string) => {
    const list = await McFormatService.list();
    list.map(async it => {
      const content = JSON.parse(JSON.stringify(it.content));
      if (it.name === name) {
        it.default = true;
        content.default = true;
      } else {
        it.default = false;
        content.default = false;
      }
      it.content = content;
      await McFormatService.save(it);
    });
  },

  save: async (format: McFmttmpl) => {
    await util.promisify(fs.writeFile)(format.path, JSON.stringify(format.content));
  },

  list: async (type: TelegramBizType | undefined = undefined): Promise<McFmttmpl[]> => {
    //preset format templates:
    // const presetDir = path.join(
    //   remote.app.getAppPath(),
    //   "build",
    //   "preset-tmpls"
    // );
    // const presetTmpls = await McFormatService._list(presetDir, type);
    //custome formate templates:
    const dir = path.join(kWorkFiles, "format");
    const customTmpls = await McFormatService._list(dir, type);

    //如果有用户自定义的报文格式，并且已经被设置为默认格式(default=true)，
    //则忽略内置报文格式设置的default=true
    // if (customTmpls.length && presetDir.length) {
    //   let customDefault = false;
    //   customTmpls.map(it => {
    //     if (it.default) {
    //       customDefault = true;
    //     }
    //     return true;
    //   });

    // customDefault &&
    //   presetTmpls.map(it => {
    //     it.default = false;
    //     return true;
    //   });
    // }

    return customTmpls;
  },

  _list: async (dir: string, type: TelegramBizType | undefined): Promise<McFmttmpl[]> => {
    if (fs.existsSync(dir)) {
      const files = await util.promisify(fs.readdir)(dir);

      const waits = files.map(async it => {
        let valid = true;
        let content = null;
        const fileContent = stripBOM(fs.readFileSync(path.join(dir, it)));
        //验证源文件内容是否为合法的JSON格式，并取出default标志：
        try {
          const fileExtName = path.extname(it);
          content = fileExtName === ".json" ? JSON.parse(fileContent) : {};
          if (type !== undefined && content.types.indexOf(type) < 0) {
            valid = false;
          }
        } catch (e) {
          console.error("not a valid json format: " + it);
          valid = false;
          console.error(e);
        }
        const stat = await util.promisify(fs.stat)(path.join(dir, it));
        return {
          name: content ? content.name : "",
          path: path.join(dir, it),
          date: moment(stat.ctime).format("YYYY-MM-DD HH:mm"),
          type: "format",
          types: content.types,
          stat: stat,
          valid: valid,
          content: content,
          default: content ? content.default : false,
        };
      });

      const fmttmpls = await Promise.all(waits);
      return fmttmpls.filter(x => x.stat.isFile() && x.valid && _.endsWith(x.path, ".json"));
    }
    return [];
  },

  /**
   * 根据电报格式名称获得格式定义，如果未找到，则返回系统设置的默认模板定义
   * @param {string} name 格式模板名称（显示名称，不是文件名）
   * @returns {Promise<Object>}
   */
  load: async (name: string, type: TelegramBizType | undefined): Promise<McFmttmpl> => {
    const allTempletes = await McFormatService.list(type);
    let defaultTmpl = null;
    for (let i in allTempletes) {
      const it = allTempletes[i];
      if (it.name === name) {
        return it;
      } else if (it.default) {
        defaultTmpl = it;
      }
    }

    if (defaultTmpl == null) {
      defaultTmpl = allTempletes[0];
    }

    return defaultTmpl;
  },
};

const _check = async () => {
  const presetDir = path.join(remote.app.getAppPath(), "build", "preset-tmpls");
  const files = await util.promisify(fs.readdir)(presetDir);

  const userDir = path.join(kWorkFiles, "format");
  await fse.ensure(userDir);
  // if (!fs.existsSync(userDir)) {
  //   util.promisify(fs.mkdir)(userDir);
  // }
  for (let i = 0; i < files.length; i++) {
    const checkFile = path.join(userDir, files[i]);
    const srcFile = path.join(presetDir, files[i]);
    if (!fs.existsSync(checkFile)) {
      util.promisify(fs.copyFile)(srcFile, checkFile);
    }
  }
};

_check();

const stripBOM = (origin: Buffer) => {
  if (origin[0] === 0xef && origin[1] === 0xbb && origin[2] === 0xbf) {
    origin = origin.slice(3);
  }

  return origin.toString("utf-8");
};

export default McFormatService;

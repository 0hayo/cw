import fs from "fs";
import path from "path";
import util from "util";
import rimraf from "rimraf";
import copy from "recursive-copy";
import message from "./message";

const fse = {
  json: async (
    dir: string
  ): Promise<{
    [key: string]: any;
  }> => {
    if (await fs.existsSync(dir)) {
      const buffer = await util.promisify(fs.readFile)(dir);
      return JSON.parse(buffer.toString());
    } else {
      return { body: {}, head: {} };
    }
  },
  ensure: async (dst: string): Promise<void> => {
    await util.promisify(fs.mkdir)(dst, { recursive: true });
  },
  images: async (dst: string): Promise<string[]> => {
    const tails = [".jpg", ".jpeg", ".png", ".docx"];
    const files = await util.promisify(fs.readdir)(dst);
    return files
      .filter(x => tails.indexOf(path.extname(x)) !== -1)
      .sort((a, b) => {
        const datea = fs.statSync(path.join(dst, a)).ctime;
        const dateb = fs.statSync(path.join(dst, b)).ctime;
        return datea >= dateb ? 1 : -1;
      })
      .map(x => path.join(dst, x));
  },
  delete: (dst: string) => {
    if (fs.existsSync(dst)) {
      rimraf.sync(dst);
    }
  },
  /**
   * 深层复制文件夹
   * src: 要复制的源目录
   * dst: 要复制到的目标目录（注意不包含源目录名称）
   */
  deepCopy: async (src: string, dst: string) => {
    copy(src, dst)
      .then(result => {
        // message.success("复制文件", "复制文件成功。");
      })
      .catch(error => {
        message.failure("复制文件", "复制文件错误！");
        console.error(error);
      });
  },
};

export default fse;

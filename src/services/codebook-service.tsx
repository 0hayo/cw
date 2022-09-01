import fs from "fs";
import _ from "lodash";
import path from "path";
import util from "util";
import moment from "moment";
import crypto from "crypto";
import { kWorkFiles } from "misc/env";
import { machineIdSync } from "node-machine-id";

/** helper functions */
const getFileName = (fileName: string): string => {
  var arr = fileName.split(".");
  return arr[0];
};

/** encrypt key */
const key = crypto.createHash("md5").update(machineIdSync(true)).digest("hex");

/** encrypt algorithm */
const cryptAlgorithm: string = "aes-256-cbc";

/** codebook file dir */
const codebookDir: string = path.join(kWorkFiles, "codebook");

/**
 *  密码本相关的服务组件g
 */
const McCodebookService = {
  /**
   * 将明文密码本的文件内容进行加密处理
   * @param {string} filePath 密码本源文件路径
   * @returns {string} 加密后的内容
   */
  encryptCodebookContent: (filePath: string): string => {
    if (!filePath) return "";

    const fileContent = fs.readFileSync(filePath).toString();

    //验证源文件内容是否为合法的JSON格式：
    try {
      JSON.parse(fileContent);
    } catch (e) {
      throw Error("文件格式错误，密码本文件必须为完整的json格式！");
    }

    const cipher = crypto.createCipheriv(cryptAlgorithm, key, Buffer.alloc(16, 0));

    let encrypted = cipher.update(fileContent, "utf8", "hex");
    encrypted += cipher.final("hex");

    return encrypted;
  },

  /**
   * 将加密过的密码本文件内容转换为明文
   * @param {string} filePath 加密过的密码本文件路径
   * @returns {string} 解密后的内容
   */
  decryptCodebookContent: (filePath: string): string => {
    if (!filePath) return "";

    const fileContent = fs.readFileSync(filePath).toString("hex");

    const decipher = crypto.createDecipheriv(cryptAlgorithm, key, Buffer.alloc(16, 0));

    let decryptedContent = decipher.update(fileContent, "hex", "utf8");
    decryptedContent += decipher.final();

    try {
      JSON.parse(decryptedContent);
    } catch (e) {
      throw Error("无法解析密码本，文件无效！");
    }

    return decryptedContent.toString();
  },

  getCodebookList: async (): Promise<McFolderMeta[]> => {
    if (fs.existsSync(codebookDir)) {
      const files = await util.promisify(fs.readdir)(codebookDir);
      const waits = files.map(async it => {
        const stat = await util.promisify(fs.stat)(path.join(codebookDir, it));
        return {
          id: "",
          name: getFileName(it),
          path: path.join(codebookDir, it),
          date: moment(stat.ctime).format("YYYY-MM-DD HH:mm"),
        };
      });

      const codebooks = await Promise.all(waits);
      return codebooks.filter(x => _.endsWith(x.path, ".codebook"));
    }
    return [];
  },

  // getCodebookByName: async (name: string): Promise<McFile | null> => {
  //   const codebooks = await McCodebookService.getCodebookList();
  //   const result = codebooks.filter(x => x.name === name);
  //   return result.length ? result[0] : null;
  // },

  /**
   * 将一段明文根据密码本转换为
   * @param {string} originTxt 明文
   * @param {string} codebook 密码本名称
   * @returns {{encrypted: string; full: boolean; unmatched: string}} {加密过的字符，是否全部转译成功，未转译的明文}
   */
  encrypt: (
    originTxt: string,
    codebook: string
  ): { encrypted: string[]; full: boolean; unmatched: string } => {
    //加载密码本
    const codebookPath = path.join(codebookDir, codebook + ".codebook");
    const codebookContent = McCodebookService.decryptCodebookContent(codebookPath).toString();
    try {
      var codebookObj = JSON.parse(codebookContent);
    } catch (e) {
      console.error("密码本:" + codebook + "格式错误", e.message || e.toString());
      throw Error("文件格式错误，密码本文件必须为完整的json格式！");
    }
    //将密码本的键值对按照明文长度排序，生成一个数组
    const valArr: any[] = [];
    for (let key in codebookObj) {
      valArr.push([codebookObj[key], key]);
    }
    valArr.sort((a, b) => (a[0].length > b[0].length ? -1 : 1));
    //按照最长匹配，用密文替换明文内容
    let encryptedTxt = originTxt;
    let unmatchedTxt = originTxt;
    for (let i in valArr) {
      const regExp = new RegExp(valArr[i][0], "g");
      encryptedTxt = encryptedTxt.replace(regExp, valArr[i][1] + ",");
      unmatchedTxt = unmatchedTxt.replace(regExp, " ");
    }
    const encryptedTxtArr = encryptedTxt.split(",");
    if (encryptedTxtArr.length && encryptedTxtArr[encryptedTxtArr.length - 1].trim() === "") {
      encryptedTxtArr.pop();
    }
    //是否所有的明文都被转译？
    unmatchedTxt = unmatchedTxt.trim();
    const fullMatch = unmatchedTxt.length === 0;

    return {
      encrypted: encryptedTxtArr,
      full: fullMatch,
      unmatched: unmatchedTxt,
    };
  },

  /**
   * 将一段密文电码转换为明文
   * @param {string} secretTxt 密文格式为连续的数字组成的字符串，无分隔符，长度须为4的整数倍
   * @param {string} codebook 密码本名称
   * @returns {{decrypted: string; full: boolean; unmatched: string}} {转换为明文后的电文, 是否全部转码成功，未成功转码的电文列表}
   */
  decrypt: (
    secretTxt: string,
    codebook: string
  ): { decrypted: string; full: boolean; unmatched: string } => {
    //将密文4位一组，切割成数组：
    const codeArr = secretTxt.replace(/(.{4})/g, "$1,").split(",");
    codeArr.pop();
    const copyArr = codeArr.slice(0); //make a copy

    //加载密码本
    const codebookPath = path.join(codebookDir, codebook + ".codebook");
    const codebookContent = McCodebookService.decryptCodebookContent(codebookPath).toString();

    //密码本转换为json对象
    try {
      var codebookObj = JSON.parse(codebookContent);
    } catch (e) {
      console.error("密码本:" + codebook + "格式错误", e.message || e.toString());
      throw Error("文件格式错误，密码本文件必须为完整的json格式！");
    }

    //根据密文从密码本中找出对应的明文，并替换到数组
    codeArr.map((it, idx) => {
      if (codebookObj[it]) {
        codeArr[idx] = codebookObj[it];
        copyArr[idx] = "matched";
      }
      return null;
    });

    const unmatchedArr = copyArr.filter(x => x !== "matched");
    const fullMatch = unmatchedArr.length === 0;

    return {
      decrypted: codeArr.join(""),
      full: fullMatch,
      unmatched: unmatchedArr.join(" "),
    };
  },
};

export default McCodebookService;

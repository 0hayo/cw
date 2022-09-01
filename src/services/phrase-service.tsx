import fs from "fs";
import path from "path";
// import util from "util";
import fetch from "utils/fetch";
import { remote } from "electron";
import { kWorkFiles } from "misc/env";

const McPhraseService = {
  save: (originCode: string, phrase: McPhrase) => {
    const allPhrases = McPhraseService.list(phrase.type);
    const found = allPhrases.find(x => x.code === phrase.code);
    if (found) {
      throw Error("短语代码【" + phrase.code + "】已存在。");
    }

    let content = _load();
    if (!content) {
      content = {
        rx: [],
        tx: [],
      };
    }

    const items: McPhrase[] = content[phrase.type];
    let exists = false;
    items.map((it, idx) => {
      if (it.code === originCode) {
        exists = true;
        it.code = phrase.code;
        it.mean = phrase.mean;
        items[idx] = it;
      }
      return it;
    });
    content[phrase.type] = items;

    if (!exists) {
      items.push({
        type: phrase.type,
        preset: phrase.preset,
        code: phrase.code,
        mean: phrase.mean,
      });
    }

    _write(false, JSON.stringify(content));
  },

  delete: (type: "rx" | "tx", code: string, preset: boolean = false) => {
    let content = _load();

    if (!content) {
      return;
    }
    const items: McPhrase[] = content[type];
    items.map((it, idx) => {
      if (it.code === code) {
        items.splice(idx, 1);
      }
      return it;
    });
    content[type] = items;

    _write(false, JSON.stringify(content));
  },

  list: (type: "rx" | "tx"): McPhrase[] => {
    //preset phrases:
    // const presetPath = path.join(
    //   remote.app.getAppPath(),
    //   "build",
    //   "preset-phrase",
    //   "phrase.json"
    // );
    // const presetPhrases = _list(presetPath, type);

    //custome formate templates:
    const customPath = path.join(kWorkFiles, "phrase", "phrase.json");
    const customPhrases = _list(customPath, type);

    return customPhrases;
  },

  listDB: async (type: "rx" | "tx"): Promise<McPhrase[]> => {
    const result = await fetch.get(`sysCallTerm/listByType/${type}`);
    const phraseList: McPhrase[] = [];
    result.data?.data?.map(it => {
      const phrase: McPhrase = {
        code: it.datagram,
        mean: it.content,
        preset: true,
        type: it.type,
      };
      phraseList.push(phrase);
      return it;
    });
    return phraseList;
  },
};

const _list = (filePath: string, type: "rx" | "tx"): McPhrase[] => {
  const phrases: McPhrase[] = [];
  if (fs.existsSync(filePath)) {
    let content = null;
    const fileContent = splitBOM(fs.readFileSync(filePath));
    //验证源文件内容是否为合法的JSON格式，并解析数据
    try {
      content = JSON.parse(fileContent);
      const items = content[type];
      for (let i in items) {
        const it = items[i];
        phrases.push({
          type: type,
          code: it.code,
          mean: it.mean,
          preset: it.preset,
        });
      }
    } catch (e) {
      console.error("not a valid json format: " + filePath);
      console.error(e);
      throw Error("短语定义文件格式错误！");
    }
  }

  return phrases;
};

const _load = (preset: boolean = false): any => {
  const filePath = preset
    ? path.join(remote.app.getAppPath(), "build", "preset-phrase", "phrase.json")
    : path.join(kWorkFiles, "phrase", "phrase.json");

  if (!fs.existsSync(filePath)) return null;
  //Load file content:
  const fileContent = splitBOM(fs.readFileSync(filePath));
  try {
    return JSON.parse(fileContent);
  } catch (e) {
    console.error("not a valid json format: " + filePath);
    console.error(e);
    throw Error("短语定义文件格式错误！");
  }
};

const _write = (preset: boolean, content: any): void => {
  const dir = preset
    ? path.join(remote.app.getAppPath(), "build", "preset-phrase")
    : path.join(kWorkFiles, "phrase");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  //Write content to file:
  fs.writeFileSync(path.join(dir, "phrase.json"), content);
};

// const _check = async () => {
//   const presetDir = path.join(
//     remote.app.getAppPath(),
//     "build",
//     "preset-phrase"
//   );
//   const files = await util.promisify(fs.readdir)(presetDir);

//   const userDir = path.join(kWorkFiles, "phrase");
//   await fse.ensure(userDir);
//   if (!fs.existsSync(userDir)) {
//     util.promisify(fs.mkdir)(userDir);
//   }
//   for (let i = 0; i < files.length; i++) {
//     const checkFile = path.join(userDir, files[i]);
//     const srcFile = path.join(presetDir, files[i]);
//     if (!fs.existsSync(checkFile)) {
//       util.promisify(fs.copyFile)(srcFile, checkFile);
//     }
//   }
// };

// _check();

const splitBOM = (origin: Buffer) => {
  if (origin[0] === 0xef && origin[1] === 0xbb && origin[2] === 0xbf) {
    origin = origin.slice(3);
  }

  return origin.toString("utf-8");
};

export default McPhraseService;

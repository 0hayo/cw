import path from "path";
import fetch from "utils/fetch";
import guid from "misc/guid";
import { LOCAL_MACHINE_ID } from "misc/env";
import fs from "fs";

const PIC_TYPES = [".jpg", ".jpeg", ".png"];
const DOC_TYPES = [".docx", ".doc", ".pdf"];

const getMode = (filename: string): McUploadFileType => {
  const extname = path.extname(filename.toLowerCase());
  if (PIC_TYPES.indexOf(extname) >= 0) {
    return "PIC";
  }
  if (DOC_TYPES.indexOf(extname) >= 0) {
    return "DOC";
  }
  if (extname === ".json") return "JSON";

  return "?";
};

const service = {
  delete: async (ids: string[]) => {
    fetch.delete("sysFiles/deleteBatch", {
      data: JSON.stringify(ids),
    });
  },

  upload: async (name: string, files: File[]) => {
    const fileNames: string[] = [];
    const rawDatas: string[] = [];
    // const waits = files.map(async it => {
    //   fileNames.push(it.name);
    //   const rawData = Buffer.from(await it.arrayBuffer()).toString("base64");
    //   rawDatas.push(rawData);
    //   return it;
    // });

    for (let i = 0; i < files.length; i++) {
      fileNames.push(files[i].name);
      const rawData = Buffer.from(fs.readFileSync(files[i].path)).toString("base64");
      rawDatas.push(rawData);
    }

    // await Promise.all(waits);
    const mode = fileNames && fileNames.length > 0 ? getMode(fileNames[0]) : "PIC";
    // path不能存进meta文件
    const meta = {
      name,
      date: new Date().toISOString(),
      mode: mode,
    };
    const reqData = {
      fileDir: guid(),
      folderName: name,
      fileNames: JSON.stringify(fileNames),
      newModel: "I",
      radioUuid: LOCAL_MACHINE_ID,
      rawDatas,
      remark: JSON.stringify(meta),
    };

    //上传文件
    const result = await fetch.post("/sysFiles/upload", JSON.stringify(reqData));
    return result.data;
  },

  // meta: async (dir: string): Promise<McFolderMeta> => {
  //   const json = await fse.json(path.join(dir, "meta.json"));

  //   return {
  //     path: dir,
  //     name: json.name,
  //     date: json.date,
  //     mode: json.mode,
  //     type: json.type,
  //   };
  // },

  search: async (
    keyword: string,
    sortord: "date" | "name",
    radioUuid: string,
    page: number = 1,
    size: number = 50
  ): Promise<IPageResult<McFolderMeta>> => {
    const sort = sortord === "date" ? "created_at desc" : "folder_name asc";

    // alert(radioUuid);
    const param = radioUuid
      ? JSON.stringify({
          folderName: keyword,
          orderStr: sort,
          radioUuid: radioUuid,
          currentPage: page,
          pageSize: size,
          delFlag: 0,
        })
      : JSON.stringify({
          folderName: keyword,
          orderStr: sort,
          currentPage: page,
          pageSize: size,
          delFlag: 0,
        });

    const result = await fetch.post("/sysFiles/listPage", param);
    const data = result.data?.data;
    const folders = data?.items;
    // alert(folders);
    const items: McFolderMeta[] = [];
    folders &&
      folders.map(it => {
        const files = it.fileNames ? JSON.parse(it.fileNames) : [];
        const mode = files.length > 0 ? getMode(files[0]) : "?";
        items.push({
          id: it.id,
          path: it.fileDir,
          name: it.folderName,
          date: it.createdAt,
          mode: mode,
          type: "",
          files: files,
        });
        return it;
      });

    return {
      currentPage: data?.currentPage,
      pageSize: data?.pageSize,
      totalNum: data?.totalNum,
      totalPage: data?.totalPage,
      items: items,
    };
  },
};

export default service;

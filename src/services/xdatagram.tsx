import fs from "fs";
import path from "path";
import util from "util";
import fse from "misc/fse";
import fetch from "utils/fetch";
import guid from "misc/guid";
import cwIForm from "../pages/cw/form";
const rTime = (date: string) => {
  var dateee = new Date(date).toJSON();
  return new Date(+new Date(dateee) + 8 * 3600 * 1000)
    .toISOString()
    .replace(/T/g, " ")
    .replace(/\.[\d]{3}Z/, "");
};

const xdatagram = {
  read: async (dir: string): Promise<McTelegram> => {
    const code = await fse.json(path.join(dir, "code.json"));
    return code as McTelegram;
  },
  readServer: async (dir: string, uuid: string): Promise<{}> => {
    const wait = fetch.get<MstResponse>(
      // `/datagramDraft/${station.uuid}`
      `/datagramDraft/${uuid}`
    );
    let metaItem = {
      from: "",
      type: "",
      name: "",
      stime: "",
      ptime: "",
    };
    let head = {};
    let body = {};
    let code = { head: {}, body: {} };
    await Promise.resolve(wait).then(response => {
      const result = response.data?.data;
      if (result) {
        let metaItem2 = {
          from: result.newModel === "M" ? "code" : "code",
          type: result.type,
          name: result.name,
          stime: result.createdAt,
          ptime: result.updatedAt,
        };
        metaItem = metaItem2;
        result.datagramDraftItemList.forEach(it => {
          if (it.headBodyFlag === "H") {
            let headItemSub = {
              value: it.itemText,
            };
            Object.assign(head, { [it.itemName]: headItemSub });
          }
          if (it.headBodyFlag === "B") {
            let headItemSub = {
              value: it.itemText,
            };
            Object.assign(body, { [it.itemName]: headItemSub });
          }
        });
        code["head"] = head;
        code["body"] = body;
        console.log("meta=", metaItem2);
        console.log("code=", code);
      } else {
      }
    });

    return { meta: metaItem, code: code };
  },
  readRecordServer: async (dir: string, uuid: string): Promise<{}> => {
    const wait = fetch.get<MstResponse>(
      // `/datagramDraft/${station.uuid}`
      `/datagramItem/${uuid}`
    );
    let metaItem = {
      from: "",
      type: "",
      name: "",
      stime: "",
      ptime: "",
    };
    let head = {};
    let body = {};
    let code = { head: {}, body: {} };
    await Promise.resolve(wait).then(response => {
      const result = response.data?.data;
      if (result) {
        // let metaItem2 = {
        //   from: result.newModel === "M" ? "code" : "code",
        //   type: result.type,
        //   name: result.name,
        //   stime: result.createdAt,
        //   ptime: result.updatedAt,
        // };
        // metaItem = metaItem2;
        result.forEach(it => {
          if (it.headBodyFlag === "H") {
            let headItemSub = {
              value: it.itemText,
            };
            Object.assign(head, { [it.itemName]: headItemSub });
          }
          if (it.headBodyFlag === "B") {
            let headItemSub = {
              value: it.itemText,
            };
            Object.assign(body, { [it.itemName]: headItemSub });
          }
        });
        code["head"] = head;
        code["body"] = body;
        // console.log("meta=", metaItem2);
        console.log("code=", code);
      } else {
      }
    });

    return { meta: metaItem, code: code };
  },
  save: async (dir: string, telegram: McTelegram): Promise<void> => {
    await util.promisify(fs.writeFile)(path.join(dir, "code.json"), JSON.stringify(telegram));
  },

  saveServer: async (
    uuid: string,
    radioUuid: string,
    title: string,
    type: number,
    isTask: boolean,
    state: string,
    newModel: string,
    status: number
  ): Promise<void> => {
    let { data } = await fetch.get<MstResponse>(`/sysDatagram/get/${uuid}`);
    console.log("dataResponse", data);
    if (data.data != null) {
      // alert(title);
      const postParm = {
        uuid: uuid,
        radioUuid: radioUuid,
        title: title,
        type: type,
        task: isTask,
        state: state,
        newModel: newModel,
        status: status,
      };
      console.log("updatedata=", postParm);
      await fetch.put<MstResponse>("/sysDatagram/update", JSON.stringify(postParm));
      console.log("updatedata=", data);
    } else {
      // alert(222);
      const postParm = {
        uuid: uuid,
        radioUuid: radioUuid,
        title: title,
        type: type,
        task: isTask,
        state: state,
        newModel: newModel,
        status: status,
      };
      console.log("postParm=", postParm);
      const { data } = await fetch.post<MstResponse>(
        "/sysDatagram/insert",
        JSON.stringify(postParm)
      );
      console.log("data=", data);
    }
  },
  updateServer: async (
    uuid: string,
    radioUuid: string,
    title: string,
    type: number,
    newModel: string,
    status: number
  ): Promise<void> => {
    const postParm = {
      uuid: uuid,
      title: title,
    };
    console.log("postParm=", postParm);
    const { data } = await fetch.put<MstResponse>("/sysDatagram/update", JSON.stringify(postParm));
    console.log("data=", data);
  },

  saveRecordServer: async (
    dir: string,
    uuid: string,
    telegram: McTelegram,
    meta: Partial<McTelegramMeta>,
    cwForm?: cwIForm,
    recordType?: string
  ): Promise<void> => {
    // alert(JSON.stringify(telegram));
    console.log("telegram....=", JSON.stringify(telegram));
    // await util.promisify(fs.writeFile)(
    //   path.join(dir, "code.json"),
    //   JSON.stringify(telegram)
    // );
    let dataContent = "";
    let datagramDraftItemList = [];
    //       "createUserUuid": "string",
    //       "createdAt": "2021-03-14 11:40:42",
    //       "cwDatagramUuid": "string",
    //       "delFlag": 0,
    //       "headBodyFlag": "string",
    //       "image": "string",
    //       "itemName": "string",
    //       "itemText": "string",
    //       "remark": "string",
    //       "status": 0,
    //       "updateUserUuid": "string",
    //       "updatedAt": "2021-03-14 11:40:42",
    //       "uuid": "string",
    //       "warn": "string"
    if (telegram.head.FROM) {
      const fromItem = {
        headBodyFlag: "H",
        itemName: "FROM",
        itemText: telegram.head.FROM.value,
        qualities: "[90,90,90,90]",
        telDatagramUuid: guid(),
        types: "[1,1,1,1]",
      };
      dataContent = dataContent + "FROM " + telegram.head.FROM.value + " ";
      datagramDraftItemList.push(fromItem);
    }
    if (telegram.head.NR) {
      const fromItem = {
        headBodyFlag: "H",
        itemName: "NR",
        itemText: telegram.head.NR.value,
        qualities: "[90,90,90,90]",
        telDatagramUuid: guid(),
        types: "[1,1,1,1]",
      };
      dataContent = dataContent + "NR " + telegram.head.NR.value + " ";
      datagramDraftItemList.push(fromItem);
    }
    if (telegram.head.CK) {
      const fromItem = {
        headBodyFlag: "H",
        itemName: "CK",
        itemText: telegram.head.CK.value,
        qualities: "[90,90,90,90]",
        telDatagramUuid: guid(),
        types: "[1,1,1,1]",
      };
      dataContent = "CK " + telegram.head.CK.value + " " + dataContent;
      datagramDraftItemList.push(fromItem);
    }
    if (telegram.head.CLS) {
      const fromItem = {
        headBodyFlag: "H",
        itemName: "CLS",
        itemText: telegram.head.CLS.value,
        qualities: "[90,90,90,90]",
        telDatagramUuid: guid(),
        types: "[1,1,1,1]",
      };
      dataContent = "CLS " + telegram.head.CLS.value + " " + dataContent;
      datagramDraftItemList.push(fromItem);
    }
    if (telegram.head.DATE) {
      const fromItem = {
        headBodyFlag: "H",
        itemName: "DATE",
        itemText: rTime(telegram.head.DATE.value),
        qualities: "[90,90,90,90]",
        telDatagramUuid: guid(),
        types: "[1,1,1,1]",
      };
      dataContent = dataContent + "DATE " + telegram.head.DATE.value + " ";
      datagramDraftItemList.push(fromItem);
    }
    if (telegram.head.TIME) {
      const fromItem = {
        headBodyFlag: "H",
        itemName: "TIME",
        itemText: rTime(telegram.head.TIME.value),
        qualities: "[90,90,90,90]",
        telDatagramUuid: guid(),
        types: "[1,1,1,1]",
      };
      dataContent = dataContent + "TIME " + telegram.head.TIME.value + " ";
      datagramDraftItemList.push(fromItem);
    }
    if (telegram.head.SIGN) {
      const fromItem = {
        headBodyFlag: "H",
        itemName: "SIGN",
        itemText: telegram.head.SIGN.value,
        qualities: "[90,90,90,90]",
        telDatagramUuid: guid(),
        types: "[1,1,1,1]",
      };
      dataContent = dataContent + "SIGN " + telegram.head.SIGN.value + " ";
      datagramDraftItemList.push(fromItem);
    }
    if (telegram.head.RMKS) {
      const fromItem = {
        headBodyFlag: "H",
        itemName: "RMKS",
        itemText: telegram.head.RMKS.value,
        qualities: "[90,90,90,90]",
        telDatagramUuid: guid(),
        types: "[1,1,1,1]",
      };
      dataContent = dataContent + "RMKS " + telegram.head.RMKS.value + " ";
      datagramDraftItemList.push(fromItem);
    }

    Object.keys(telegram.body).forEach(x => {
      const fromItem = {
        headBodyFlag: "B",
        itemName: x,
        itemText: telegram.body[x].value,
        qualities: "" + telegram.body[x].ratio,
        telDatagramUuid: guid(),
        types: "[1,1,1,1]",
      };
      dataContent = dataContent + " " + telegram.body[x].value;
      datagramDraftItemList.push(fromItem);
    });

    console.log("cwform", cwForm);

    let url = "";
    let sendRecvFlag = "S";
    if (recordType === "CWS") {
      url = "/datagramRecord/saveSendCw";
      sendRecvFlag = "S";
    } else if (recordType === "CWR") {
      url = "/datagramRecord/saveRecvCw";
      sendRecvFlag = "R";
    } else if (recordType === "TELS") {
      url = "/datagramRecord/saveSendTel";
      sendRecvFlag = "S";
    } else if (recordType === "TELR") {
      url = "/datagramRecord/saveRecvTel";
      sendRecvFlag = "R";
    }

    const postParm = {
      contactStationCode: cwForm.contactStation.stationCode,
      contactStationName: cwForm.contactStation.stationName,
      contactStationUuid: cwForm.contactStation.uuid,
      datagramRecordVoList: [
        {
          communicationFlag: "N",
          dataContent: dataContent,
          datagramDraftUuid: uuid,
          datagramItemVoList: datagramDraftItemList,
          datagramName: meta.name,
          datagramType: "CW",
          endTime: rTime(meta.ptime),
          frowardingDatagramUuid: "",
          length: "",
          modemEncryption: "",
          modemVocoderBaud: "",
          offset: "",
          path: "",
          rawData: dataContent,
          rawDataType: "MSG",
          sendRecvFlag: sendRecvFlag,
          sessionName: "",
          startTime: rTime(meta.stime),
          timeLong: "",
          uuid: guid(),
        },
      ],
      endTime: rTime(meta.ptime),
      name: cwForm.activeRadio.sessionName,
      rxFile: "",
      rxLength: "",
      sendRecvFlag: sendRecvFlag,
      sessionTitle: meta.name,
      startTime: rTime(meta.stime),
      timeLong: "",
      transceiverUuid: cwForm.activeRadio.uuid,
      txFile: "",
      txLength: "",
    };

    console.log("postParmRecord=", postParm);

    const { data } = await fetch.post<MstResponse>(url, JSON.stringify(postParm));
    console.log("data=", data);
  },
};

export default xdatagram;

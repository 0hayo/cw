import guid from "misc/guid";

const offset = (data: any) => data.offsets[0];
const length = (data: any) =>
  data.offsets[data.offsets.length - 1] - data.offsets[0] + data.lengths[data.lengths.length - 1];

const parser = {
  head: (data: any, type: TelegramBizType): McTelegramHash => {
    const hash: McTelegramHash = {};
    const head = data.telegram.head;

    if (head["FROM"]) {
      hash["FROM"] = {
        value: head["FROM"].text,
        crude: head["FROM"].crude,
        ratio: head["FROM"].qualities,
        offset: offset(head["FROM"]),
        length: length(head["FROM"]),
      };
    }
    if (head["NR"]) {
      hash["NR"] = {
        value: head["NR"].text,
        crude: head["NR"].crude,
        ratio: head["NR"].qualities,
        offset: offset(head["NR"]),
        length: length(head["NR"]),
      };
    }

    if (head["CK"]) {
      hash["CK"] = {
        value: head["CK"].text,
        crude: head["CK"].crude,
        ratio: head["CK"].qualities,
        offset: offset(head["CK"]),
        length: length(head["CK"]),
      };
    }

    if (head["CLS"]) {
      hash["CLS"] = {
        value: head["CLS"].text,
        crude: head["CLS"].crude,
        ratio: head["CLS"].qualities,
        offset: offset(head["CLS"]),
        length: length(head["CLS"]),
      };
    }

    if (head["DATE"]) {
      hash["DATE"] = {
        value: head["DATE"].text,
        crude: head["DATE"].crude,
        ratio: head["DATE"].qualities,
        offset: offset(head["DATE"]),
        length: length(head["DATE"]),
      };
    }

    if (head["TIME"]) {
      hash["TIME"] = {
        value: head["TIME"].text,
        crude: head["TIME"].crude,
        ratio: head["TIME"].qualities,
        offset: offset(head["TIME"]),
        length: length(head["TIME"]),
      };
    }

    if (head["SIGN"]) {
      hash["SIGN"] = {
        value: head["SIGN"].text,
        crude: head["SIGN"].crude,
        ratio: head["SIGN"].qualities,
        offset: offset(head["SIGN"]),
        length: length(head["SIGN"]),
      };
    }
    if (head["RMKS"]) {
      hash["RMKS"] = {
        value: head["RMKS"].text,
        crude: head["RMKS"].crude,
        ratio: head["RMKS"].qualities,
        offset: offset(head["RMKS"]),
        length: length(head["RMKS"]),
      };
    }

    return hash;
  },
  body: (data: any): McTelegramHash => {
    const hash: McTelegramHash = {};
    const body = data.telegram.body;
    const keys = Object.keys(body);
    // console.log("keyslength=", keys.length);
    keys.forEach(k => {
      // console.log("kkk"+k,body[k]);
      if (offset(body[k])) {
        hash[k] = {
          value: body[k].text,
          crude: body[k].crude,
          ratio: body[k].qualities,
          offset: offset(body[k]),
          length: length(body[k]),
        };
      }
    });

    return hash;
  },
  tx: (payload: any): Message => {
    const sent = payload.text.substr(0, payload.nrCharsSent).toUpperCase();
    const left = payload.text.substr(payload.nrCharsSent).toUpperCase();
    return {
      uuid: guid(),
      // uuid: payload.complete ? guid() : "mc-feed-message-tx",
      // uuid: payload.complete ? "mc-feed-message-tx" : guid() ,
      type: "tx",
      ratio: [],
      value: sent,
      crude: sent,
      left: left,
      path: payload.storage.fileName,
      offset: payload.storage.offset,
      length: payload.storage.length,
      time: payload.timestamp
        ? new Date(payload.timestamp).toISOString()
        : new Date().toISOString(),
      complete: payload.progress === 100 ? true : false,
    };
  },
  rx: (payload: any): Message => {
    return {
      uuid: guid(),
      // uuid: payload.complete ? guid() : "mc-feed-message-rx",
      // uuid: payload.complete ? "mc-feed-message-rx" : guid() ,
      type: "rx",
      value: payload.qwString.text,
      crude: payload.qwString.text,
      ratio: payload.qwString.qualities.map((it: number) => Math.ceil(it)),
      path: payload.storage.fileName,
      offset: payload.storage.offset,
      length: payload.storage.length,
      time: payload.timestamp
        ? new Date(payload.timestamp).toISOString()
        : new Date().toISOString(),
      origin: {
        text: payload.qwString.text,
        offsets: payload.qwString.offsets,
        lengths: payload.qwString.lengths,
        qualities: payload.qwString.qualities,
      },
      complete: payload.complete,
    };
  },
};

export default parser;

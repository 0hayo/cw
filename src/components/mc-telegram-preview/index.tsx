import "./index.less";
import { PrinterOutlined, ExportOutlined } from "@ant-design/icons";
import message from "misc/message";
import React, { FC, useCallback, useEffect, useState } from "react";
import xcode from "services/xcode";
import xmeta from "services/xmeta";
import moment from "moment";
import { ipcRenderer } from "electron";
import path from "path";
import fs from "fs";
import os from "os";
import xregular from "services/xregular";
import McModalNice from "components/mc-modal-nice";

interface IProps {
  telegramUuid: string;
  onClose?: () => void;
  onPrinted?: () => void;
  types?: string;
}

const NEW_LINE = os.EOL;

/** 报文预览组件 */
const McTelegramPreview: FC<IProps> = ({ telegramUuid, onClose, onPrinted, types }) => {
  const [telegramContent, setTelegramContent] = useState<string>();
  const [telegramMeta, setTelegramMeta] = useState<McTelegramMeta>();

  useEffect(() => {
    (async () => {
      setTelegramContent("");
      setTelegramMeta(null);
      console.log("types======", types, ", telegramUuid=====", telegramUuid);
      try {
        const meta = await xmeta.readServer(telegramUuid);
        setTelegramMeta(meta as McTelegramMeta);
        let codeAllTmp;
        if (types === "regular") {
          codeAllTmp = await xregular.readServer(telegramUuid);
        } else {
          const codeAll = await xcode.readServer(telegramUuid, telegramUuid);
          codeAllTmp = codeAll["code"] as McTelegram;
        }
        const code = codeAllTmp as McTelegram;
        const head = code.head;
        const body = code.body;
        let text = "";
        const NR = head["NR"]?.value;
        const CK = head["CK"]?.value;
        const CLS = head["CLS"]?.value;
        const DATE = head["DATE"]?.value;
        const TIME = head["TIME"]?.value;
        const RMKS = head["RMKS"]?.value;
        text += `号数:${NR || "    "}`;
        if (meta.type !== "EX") {
          text += `  组数:${CK || "    "}`;
          text += `  等级:${CLS || "    "}`;
          text += `  月日:${DATE || "    "}`;
        }
        text += `  时分:${TIME || "    "}`;
        text += NEW_LINE;
        text += `附注: ${RMKS || "    "}`;
        text += NEW_LINE;
        text += "-------------------------------------------------";
        text += NEW_LINE;
        Object.keys(body).map((key, idx) => {
          let value = body[key]?.value;
          if (!value) value = "";
          if (idx % 10 === 0) {
            text += value;
          } else if (idx % 10 === 9) {
            text += " " + value;
            if (idx % 100 === 99) {
              text += " -" + (idx + 1) / 100 + NEW_LINE + NEW_LINE;
            } else {
              text += NEW_LINE;
            }
          } else {
            text += " " + value;
          }
          return key;
        });
        text += NEW_LINE + NEW_LINE + "END";
        setTelegramContent(text);
      } catch (ex) {
        message.failure("加载报文错误", ex.message || ex.toString());
        console.error(ex);
      }
    })();
  }, [telegramUuid, types]);

  useEffect(() => {
    ipcRenderer.on("selectedDir", (event, filePath) => {
      if (filePath !== null && filePath !== undefined) {
        const successMsg = <>报文已保存到: {filePath}</>;
        fs.writeFile(filePath, telegramContent, () => {
          // message.destroy();
          message.success("导出报文成功！", successMsg);
        });
      }
    });
    return () => {
      ipcRenderer.removeAllListeners("selectedDir");
    };
  }, [telegramContent]);

  const save = useCallback(() => {
    // const currTime = moment().format("YYYYMMDDHHmmss");
    const plainTitle = telegramMeta["name"] || "";
    const fileName =
      (plainTitle
        ? plainTitle + moment(Date.now()).format("YYYYMMDDHHmmss")
        : moment(Date.now()).format("YYYYMMDDHHmmss")) + ".txt";
    // (plainTitle
    //     ? plainTitle +
    //       (telegramMeta["stime"]
    //         ? `_${moment(telegramMeta["stime"]).format("YYYYMMDDHHmmss")}`
    //         : `_${currTime}`)
    //     : moment(telegramMeta["stime"]).format("YYYYMMDDHHmmss")
    //     ? moment(telegramMeta["stime"]).format("YYYYMMDDHHmmss")
    //     : currTime) + ".txt";
    // ipcRenderer.removeAllListeners("selectedDir");
    ipcRenderer.send("open-save-dialog", {
      title: "选择导出文件存储路径",
      defaultPath: path.join(os.homedir(), fileName),
      filters: [{ name: "文本文件", extensions: ["txt"] }],
    });
  }, [telegramMeta]);

  const print = () => {
    const el = document.getElementById("preview-content") as HTMLDivElement;

    ipcRenderer.once("did-print", (_, result, reason) => {
      if (result === false && reason !== "cancelled") {
        message.failure("打印失败", reason);
      } else {
        onPrinted && onPrinted();
      }
    });

    ipcRenderer.send("new-print", el.innerHTML);
  };

  return (
    <McModalNice
      title={` ${telegramMeta ? telegramMeta["name"] : ""}`}
      centered
      visible
      className="mc_telegram_preview"
      wrapClassName="mc_telegram_preview_wrap"
      width="auto"
      closable={true}
      footer={false}
      mask={false}
      destroyOnClose
      onCancel={() => onClose && onClose()}
      onOk={() => onClose && onClose()}
    >
      <div className="preview-box">
        <div className="preview-funcs">
          <ExportOutlined title="导出" onClick={() => save()} />
          <PrinterOutlined title="打印" onClick={() => print()} />
        </div>
        <div id="preview-content">
          <div className="preview-title">{telegramMeta ? telegramMeta["name"] : ""}</div>
          <pre>{telegramContent}</pre>
        </div>
      </div>
    </McModalNice>
  );
};

export default McTelegramPreview;

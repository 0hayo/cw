import "./index.less";
import React, { FC, useCallback, useEffect, useState } from "react";
import McButton from "components/mc-button";
import fetch from "utils/fetch";
import message from "misc/message";
import useAutoHeight from "hooks/useAutoHeight";

interface IProps {
  fileName: string;
  filePath: string;
  loading?: boolean;
  onScan?: (telegram: McTelegram, name: string, type: TelegramBizType) => void;
}

const McJsonViewer: FC<IProps> = ({ fileName, filePath, loading = false, onScan }) => {
  const [text, setText] = useState("");
  const [jsonObj, setJsonObj] = useState({});
  const height = useAutoHeight("mc-json-viewer__inner", 16);

  const parseJson = useCallback(() => {
    const telegram: McTelegram = { head: {}, body: {} };
    //报文名称、类型
    const type = jsonObj["type"];
    const name = jsonObj["name"];
    //解析报头
    const head = jsonObj["head"];
    const body = jsonObj["body"];
    const teleHead = {};
    const teleBody = {};
    head &&
      Object.keys(head).map(k => {
        const value = head[k];
        if (value) {
          teleHead[k] = { value: value };
        }
        return k;
      });
    body &&
      Object.keys(body).map((k, idx) => {
        const value = body[k];
        if (value) {
          teleBody[idx + ""] = { value: value };
        }
        return k;
      });
    telegram.head = teleHead;
    telegram.body = teleBody;

    onScan && onScan(telegram, name, type);
  }, [jsonObj, onScan]);

  useEffect(() => {
    if (!filePath) return;
    try {
      fetch.get(filePath).then(data => {
        //格式化JSON显示：
        const _jsonData = data.data;
        setJsonObj(_jsonData);
        setText(JSON.stringify(_jsonData, null, "  "));
      });
    } catch (e) {
      message.failure("加载文件错误", "无法读取文件");
      return;
    }
  }, [filePath]);

  return (
    <div className="mc-json-viewer">
      <div className="mc-json-viewer__inner" id="mc-json-viewer__inner">
        <div className="mc-json-viewer__filename">{fileName}</div>
        <pre style={{ userSelect: "text", height: height }}>{text}</pre>
      </div>
      <div className="mc-json-viewer__menu">
        {onScan && (
          <McButton icon="send" type="primary" loading={loading} onClick={() => parseJson()}>
            识别JSON内容
          </McButton>
        )}
      </div>
    </div>
  );
};

export default McJsonViewer;

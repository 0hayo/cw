import "./index.less";
import React, { FC, useState, useEffect } from "react";
import { PlusSquareOutlined } from "@ant-design/icons";
import { IPhraseForm } from "./types";
import PhraseItem from "./item";
import fetch from "utils/fetch";
import useSave from "./useSave";
import useRemove from "./useRemove";
import withTabbar from "hoc/withTabbar";

interface IPhrasePages extends IFormPages {
  type: "tx" | "rx";
}

// 勤务短语
const ServicePhrase: FC = () => {
  // 初始请求 参数
  const [pages, setPages] = useState<IPhrasePages>({
    currentPage: 1,
    pageSize: 100,
    type: "tx",
    orderStr: "created_at asc",
  });
  const [telegram, setTelegram] = useState({
    tab: "tx",
    add: false,
  });

  const [phraseList, setPhraseList] = useState<IPhraseForm>(null);

  const save = useSave(); // 保存 or 更新
  const remove = useRemove(); // 删除短语
  const [scrollHeight, setScrollHeight] = useState(0);

  // 获取列表数据
  useEffect(() => {
    const wait = fetch.post<ManageResponse>("/sysCallTerm/listPage", JSON.stringify(pages));
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) {
        setPhraseList(x => ({
          ...x,
          totalPage: result.data.totalPage,
          items: result.data.items,
        }));
      }
    });

    //设置滚动区域高度
    const el = document.getElementById("phrase_wrapper");
    setScrollHeight(el.clientHeight - 64);
  }, [pages, setPhraseList, telegram]);

  // 切换tab 选择收报还是 发报
  const switchTabbar = e => {
    if (e === telegram.tab) return;
    // 修改点击状态
    setPages(x => ({
      ...x,
      type: e === "tx" ? "tx" : "rx",
    }));

    setTelegram(x => ({
      ...x,
      tab: e,
    }));
  };

  return (
    <>
      <div className="phrase_title">
        <div
          className={`phrase_title_text ${telegram.tab === "tx" ? "active" : null}`}
          onClick={e => switchTabbar("tx")}
        >
          发报短语
        </div>
        <div
          className={`phrase_title_text ${telegram.tab === "rx" ? "active" : null}`}
          onClick={e => switchTabbar("rx")}
        >
          收报短语
        </div>
      </div>
      <div className="phrase" id="phrase_wrapper">
        <div className="phrase-table-head">
          <div className="head-name">勤务短语</div>
          <div className="head-text">报文格式</div>
          <div className="head-edit">编辑</div>
        </div>
        <div className="phrase_content" style={{ height: scrollHeight }}>
          {phraseList &&
            phraseList.items.map(item => (
              <PhraseItem
                key={item.id}
                id={item.id}
                mode={item.mode ? "save" : "edit"}
                code={item.datagram}
                text={item.content}
                type={telegram.tab === "tx" ? "tx" : "rx"}
                onSave={(code, text, type, id) => {
                  save(type, code, text, id);
                }}
                onDrop={id => {
                  remove(id);
                  setTelegram(x => ({ ...x, add: false }));
                }}
              ></PhraseItem>
            ))}
          {telegram.add && (
            <PhraseItem
              id={null}
              mode="new"
              code=""
              text=""
              type={telegram.tab === "tx" ? "tx" : "rx"}
              onSave={(code, text, type, id) => {
                save(type, code, text, id);
                setTelegram(x => ({ ...x, add: false }));
              }}
              onDrop={id => setTelegram({ ...telegram, add: false })}
            ></PhraseItem>
          )}
        </div>
        <div className="phrase_add">
          <PlusSquareOutlined onClick={e => setTelegram(x => ({ ...x, add: true }))} />
        </div>
      </div>
    </>
  );
};

export default withTabbar(ServicePhrase)("setting-phrase");

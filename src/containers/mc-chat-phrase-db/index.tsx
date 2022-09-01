import "./index.less";
import { Select } from "antd";
import useData from "./useData";
import React, { FC, useState, useEffect, useCallback, KeyboardEvent, ChangeEvent } from "react";
import McPhraseModal from "./phrase-modal";
import message from "misc/message";
import { checkTxContent } from "misc/util";
import McIcon from "components/mc-icon";

const McChatButton: FC<{
  disabled: boolean;
  onClick: VoidFunction;
}> = props => (
  <button
    onClick={props.onClick}
    disabled={props.disabled ? props.disabled : false}
    className="mc-chat-phrase__send"
    title="发送"
  >
    <McIcon>send</McIcon>
  </button>
);

interface IProps {
  type: "tx" | "rx";
  hint: Array<{
    label: string;
    value: string;
  }>;
  value: string;
  disabled?: boolean;
  history: Message[];
  onLaunch: (text: string) => void;
}

const McChatPhrase: FC<IProps> = ({
  type,
  hint,
  onLaunch,
  value = "",
  disabled = false,
  history = [],
}) => {
  // const guid = useGuid();
  const data = useData(type);
  const [item, setItem] = useState("");
  const [text, setText] = useState(value);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [phraseModal, setPhraseModal] = useState(false);
  useEffect(() => setText(value), [value]);
  useEffect(() => {
    const it = hint[0];
    if (it) {
      setText(it.value);
      setItem(it.value);
    } else {
      setItem("");
    }
  }, [hint]);

  const checkContent = (content: string): boolean => {
    const check = checkTxContent(content);

    if (check.result) return true;

    const ix = check.firstIndex;
    const chars = check.chars;

    const target = document.getElementById("mc-chat-textarea") as HTMLTextAreaElement;
    if (target) {
      target.focus();
      target.setSelectionRange(ix, ix + 1);
      message.failure(
        "无效的字符", //eslint-disable-next-line
        `"${chars.join('"， "')}"不是有效的短语字符，请修正后再发送！`,
        false,
        3
      );
    }
    return false;
  };

  const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.currentTarget.value);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.currentTarget.id !== "mc-chat-textarea") return;
      if (event.key === "Enter") {
        //回车
        event.preventDefault();
        event.stopPropagation();
        if (disabled) return;

        if (!text) {
          setPhraseModal(true);
          return;
        }

        const ix = text.search("%");
        if (text && ix === -1) {
          //检查是否含有非法的字符
          const checkResult = checkContent(text);
          if (!checkResult) return;

          onLaunch(text);
          setText("");
          return;
        }
        event.currentTarget.setSelectionRange(ix, ix + 1);
        message.warning("请将占位符`%`替换为具体要发送的内容。");
      } else if (event.key === "ArrowUp") {
        //上箭头
        const index = historyIdx + 1;
        if (history && history[index]) {
          setText(history[index].value);
          setHistoryIdx(index);
        } else {
          setHistoryIdx(-1);
          setText("");
        }
      } else if (event.key === "ArrowDown") {
        //下箭头
        const index = historyIdx - 1;
        if (history && history[index]) {
          setText(history[index].value);
          setHistoryIdx(index);
        } else {
          setHistoryIdx(history?.length);
          setText("");
        }
      }
    },
    [text, disabled, history, historyIdx, onLaunch]
  );

  const handleChatClick = useCallback(() => {
    let textarea = document.getElementById("mc-chat-textarea") as HTMLTextAreaElement;

    if (!textarea.value) {
      setPhraseModal(true);
      return;
    }

    const ix = textarea.value.search("%");
    // if (text && ix === -1) {
    if (textarea.value && ix === -1) {
      const checkResult = checkContent(textarea.value);
      if (!checkResult) return;

      onLaunch(textarea.value);
      setText("");
      return;
    }

    // const target = document.getElementById(`mc-${guid}`) as HTMLTextAreaElement;
    const target = document.getElementById("mc-chat-textarea") as HTMLTextAreaElement;
    if (target) {
      target.focus();
      target.setSelectionRange(ix, ix + 1);
      message.warning("请将占位符`%`替换为具体要发送的内容。");
      return;
    }
    // }, [guid, text, onLaunch]);
  }, [onLaunch]);

  return (
    <div className="mc-chat-phrase">
      {/* <div
        className="mc-chat-phrase__modal-btn"
        title="快捷短语"
        onClick={() => setPhraseModal(!phraseModal)}
      >
        <McIcon className="chat-btn-icon">chat-outlined</McIcon>
      </div> */}
      {phraseModal && (
        <McPhraseModal
          phraseList={data}
          initText={value}
          history={history}
          disabled={disabled}
          onLaunch={onLaunch}
          onClose={() => setPhraseModal(false)}
        />
      )}

      {/* <div className="mc-chat-phrase__flex">
        <div className="mc-chat-phrase__list">
          {data?.map((it, ix) => (
            <Item key={ix} text={it} disabled={disabled} onClick={() => handleItemClick(it.code)} />
          ))}
        </div>
      </div> */}
      {hint && hint.length > 0 && (
        <Select
          showArrow
          value={item}
          placeholder="选择回复"
          onSelect={value => {
            setText(value as string);
            setItem(value as string);
          }}
        >
          {hint.map(x => (
            <Select.Option key={x.value} value={x.value}>
              {x.label}
            </Select.Option>
          ))}
        </Select>
      )}
      <div className="mc-chat-phrase__text">
        <textarea
          // id={`mc-${guid}`}
          id="mc-chat-textarea"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="mc-chat-phrase__area"
          placeholder={`输入通信短语，按回车键发送;${"\n"}按上下箭头可翻阅历史发送记录;`}
        />
        <div style={{ paddingRight: 4 }}>
          <div style={{ height: "100%" }}>
            <McChatButton disabled={disabled} onClick={handleChatClick} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default McChatPhrase;

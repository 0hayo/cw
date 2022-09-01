import React, { FC, useState, useCallback, KeyboardEvent, ChangeEvent } from "react";
import message from "misc/message";
import { checkTxContent } from "misc/util";
import McModalNice from "components/mc-modal-nice";
import { RocketFilled } from "@ant-design/icons";

//-------------------------一些小组件-------------------------------
/** 特殊字符Ü按钮 */
const McSpecButton: FC<{
  onClick: VoidFunction;
}> = props => (
  <button title="特殊字符Ü" onClick={props.onClick} className="mc-chat-phrase__spec">
    Ü
  </button>
);

/** 发送按钮 */
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
    <RocketFilled />
  </button>
);

/** 短语item */
const Item: FC<{
  text: McPhrase;
  disabled: boolean;
  onClick: VoidFunction;
}> = ({ text, disabled, onClick }) => {
  return (
    <div className="mc-chat-phrase__item">
      <div className="mc-chat-phrase__mean" title={text.mean}>
        {text.mean}
      </div>
      <div className="mc-chat-phrase__code">{text.code}</div>
      <McChatButton onClick={onClick} disabled={disabled} />
    </div>
  );
};

//-------------------------主组件：短语对话框---------------------------------

interface IPhraseModalProps {
  phraseList: McPhrase[];
  initText: string;
  history: Message[];
  disabled: boolean;
  onLaunch: (text: string) => void;
  onClose: () => void;
}

/** 短语对话框 */
const McPhraseModal: FC<IPhraseModalProps> = ({
  phraseList,
  initText,
  history,
  disabled,
  onLaunch,
  onClose,
}) => {
  const [textInner, setTextInner] = useState(initText);
  const [historyIdxInner, setHistoryIdxInner] = useState(-1);

  const checkContent = (content: string): boolean => {
    const check = checkTxContent(content);

    if (check.result) return true;

    const ix = check.firstIndex;
    const chars = check.chars;

    const target = document.getElementById("mc-chat-textarea-inner") as HTMLTextAreaElement;
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

  const handleKeyDownInner = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.currentTarget.id !== "mc-chat-textarea-inner") return;
      if (event.key === "Enter") {
        //回车
        event.preventDefault();
        event.stopPropagation();

        const ix = textInner.search("%");
        if (textInner && ix === -1) {
          //检查是否含有非法的字符
          const checkResult = checkContent(textInner);
          if (!checkResult) return;

          onLaunch(textInner);
          setTextInner("");
          // setText("");
          onClose();
          return;
        }
        event.currentTarget.setSelectionRange(ix, ix + 1);
        message.warning("请将占位符`%`替换为具体要发送的内容。");
        return;
      } else if (event.key === "ArrowUp") {
        //上箭头
        const index = historyIdxInner + 1;
        if (history && history[index]) {
          setTextInner(history[index].value);
          setHistoryIdxInner(index);
        } else {
          setHistoryIdxInner(-1);
          setTextInner("");
        }
      } else if (event.key === "ArrowDown") {
        //下箭头
        const index = historyIdxInner - 1;
        if (history && history[index]) {
          setTextInner(history[index].value);
          setHistoryIdxInner(index);
        } else {
          setHistoryIdxInner(history?.length);
          setTextInner("");
        }
      }
    },
    [historyIdxInner, textInner, history, onClose, onLaunch]
  );

  const handleSpecClickInner = useCallback(() => {
    const target = document.getElementById("mc-chat-textarea-inner") as HTMLTextAreaElement;
    if (target) {
      target.setRangeText("Ü");
      setTextInner(target.value);
    }
  }, []);

  const handleChangeInner = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setTextInner(event.currentTarget.value);
  }, []);

  const handleChatClickInner = useCallback(() => {
    let textarea = document.getElementById("mc-chat-textarea-inner") as HTMLTextAreaElement;
    const ix = textarea.value.search("%");
    if (textarea.value && ix === -1) {
      //检查是否含有非法的字符
      const checkResult = checkContent(textarea.value);
      if (!checkResult) return;

      onLaunch(textarea.value);
      setTextInner("");
      return;
    }

    const target = document.getElementById("mc-chat-textarea-inner") as HTMLTextAreaElement;
    if (target) {
      target.focus();
      target.setSelectionRange(ix, ix + 1);
      message.warning("请将占位符`%`替换为具体要发送的内容。");
    }
  }, [onLaunch]);

  const handleItemClickInner = useCallback(
    (code: string) => {
      setTextInner(code);
      const ix = code.search("%");
      if (code && ix === -1) {
        onLaunch(code);
        onClose();
        return;
      }

      const target = document.getElementById("mc-chat-textarea-inner") as HTMLTextAreaElement;
      if (target) {
        target.focus();
        target.textContent = code;
        target.setSelectionRange(ix, ix + 1);
      }
    },
    [onClose, onLaunch]
  );

  return (
    <McModalNice
      className="mc-phrase-modal"
      wrapClassName="mc-phrase-modal-wrapper"
      centered
      closable={true}
      maskClosable={true}
      visible={true}
      title="通信短语"
      onCancel={() => onClose()}
      okText="发送"
      onOk={handleChatClickInner}
      okButtonProps={{ disabled: disabled }}
    >
      <div className="mc-chat-phrase">
        <div className="mc-chat-phrase__flex">
          <div className="mc-chat-phrase__list">
            {phraseList?.map((it, ix) => (
              <Item
                key={`inner-${ix}`}
                text={it}
                disabled={disabled}
                onClick={() => {
                  handleItemClickInner(it.code);
                }}
              />
            ))}
          </div>
        </div>
        <div className="mc-chat-phrase__text">
          <textarea
            id="mc-chat-textarea-inner"
            value={textInner}
            onChange={handleChangeInner}
            onKeyDown={handleKeyDownInner}
            className="mc-chat-phrase__area"
            placeholder={`在此输入通信短语，回车键发送;${"\n"}上下箭头可翻阅历史记录${"\n"}`}
          />
          <div style={{ paddingRight: 4 }}>
            <div style={{ height: "60%" }}>
              <McChatButton disabled={disabled} onClick={handleChatClickInner} />
            </div>
            <McSpecButton onClick={handleSpecClickInner} />
          </div>
        </div>
      </div>
    </McModalNice>
  );
};

export default McPhraseModal;

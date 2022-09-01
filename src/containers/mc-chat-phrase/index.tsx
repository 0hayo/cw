import "./index.less";
import { Select } from "antd";
import useData from "./useData";
// import useGuid from "hooks/useGuid";
import McIcon from "components/mc-icon";
import React, { FC, useState, useEffect, useCallback, KeyboardEvent, ChangeEvent } from "react";

const McChatButton: FC<{
  disabled: boolean;
  onClick: VoidFunction;
}> = props => (
  <button
    onClick={props.onClick}
    disabled={props.disabled ? props.disabled : false}
    className="mc-chat-phrase__send"
  >
    <McIcon>send</McIcon>
  </button>
);

const McSpecButton: FC<{
  onClick: VoidFunction;
}> = props => (
  <button onClick={props.onClick} className="mc-chat-phrase__spec">
    Ü
  </button>
);

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

  const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.currentTarget.value);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.keyCode === 13) {
        //回车
        event.preventDefault();
        event.stopPropagation();

        const ix = text.search("%");
        if (text && ix === -1) {
          onLaunch(text);
          setText("");
          return;
        }
        event.currentTarget.setSelectionRange(ix, ix + 1);
      } else if (event.keyCode === 38) {
        //上箭头
        const index = historyIdx + 1;
        if (history && history[index]) {
          setText(history[index].value);
          setHistoryIdx(index);
        } else {
          setHistoryIdx(-1);
          setText("");
        }
      } else if (event.keyCode === 40) {
        //下箭头
        const index = historyIdx - 1;
        if (history && history[index]) {
          setText(history[index].value);
          setHistoryIdx(index);
        } else {
          setHistoryIdx(-1);
          setText("");
        }
      }
    },
    [text, history, historyIdx, onLaunch]
  );

  const handleChatClick = useCallback(() => {
    // alert(111);

    let textarea = document.getElementById("mc-chat-textarea") as HTMLTextAreaElement;
    // setText(textarea.value);
    // const ix = text.search("%");
    // alert(textarea.value);
    const ix = textarea.value.search("%");
    // if (text && ix === -1) {
    if (textarea.value && ix === -1) {
      // onLaunch(text);
      onLaunch(textarea.value);
      setText("");
      return;
    }

    // const target = document.getElementById(`mc-${guid}`) as HTMLTextAreaElement;
    const target = document.getElementById("mc-chat-textarea") as HTMLTextAreaElement;
    if (target) {
      target.focus();
      target.setSelectionRange(ix, ix + 1);
    }
    // }, [guid, text, onLaunch]);
  }, [onLaunch]);

  const handleItemClick = useCallback(
    (code: string) => {
      const ix = code.search("%");
      if (code && ix === -1) {
        onLaunch(code);
        return;
      }

      setText(code);
      const target =
        // document.getElementById(`mc-${guid}`) as HTMLTextAreaElement;
        document.getElementById("mc-chat-textarea") as HTMLTextAreaElement;
      if (target) {
        target.focus();
        target.setSelectionRange(ix, ix + 1);
      }
    },
    // [guid, onLaunch]
    [onLaunch]
  );

  const handleSpecClick = useCallback(() => {
    const target = document.getElementById("mc-chat-textarea") as HTMLTextAreaElement;
    // const target = document.getElementById(`mc-${guid}`) as HTMLTextAreaElement;
    if (target) {
      target.setRangeText("Ü");
      setText(target.value);
    }
    // }, [guid]);
  }, []);

  return (
    <div className="mc-chat-phrase">
      <div className="mc-chat-phrase__flex">
        <div className="mc-chat-phrase__list">
          {data.map((it, ix) => (
            <Item key={ix} text={it} disabled={disabled} onClick={() => handleItemClick(it.code)} />
          ))}
        </div>
      </div>
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
        />
        <div style={{ paddingRight: 4 }}>
          <div style={{ height: "60%" }}>
            <McChatButton disabled={disabled} onClick={handleChatClick} />
          </div>
          <McSpecButton onClick={handleSpecClick} />
        </div>
      </div>
    </div>
  );
};

export default McChatPhrase;

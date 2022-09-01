import React, { FC, useState } from "react";

interface IProps {
  text: string;
  origin?: string;
  onChange: (text: string) => void;
  onSelect?: (text: string, position: number) => void;
}

const McChatText: FC<IProps> = ({ text, origin, onChange, onSelect }) => {
  const [showOrigin, setShowOrigin] = useState(false);
  return (
    <div className="mc-chat-text">
      <div className="mc-chat-text__title" onClick={() => setShowOrigin(!showOrigin)}>
        报文：
      </div>
      <textarea
        value={text.replace(/,/g, "")}
        className="mc-chat-text__area"
        // onChange={event => onChange(event.currentTarget.value.toUpperCase())}
        onSelect={event => {
          onSelect && onSelect(event.currentTarget.value, event.currentTarget.selectionStart);
        }}
      />
      {showOrigin && <div className="mc-chat-text__origin">原始报文: {origin}</div>}
    </div>
  );
};

export default McChatText;

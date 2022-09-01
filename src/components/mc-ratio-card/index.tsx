import "./index.less";
import { Radio } from "antd";
import React, { FC } from "react";
import McIcon from "components/mc-icon";
import { MceFlag } from "mce/typing";

interface IProps {
  value: MceFlag;
  warn?: boolean;
  onChange: (value: MceFlag) => void;
}

const McRatioCard: FC<IProps> = props => {
  return (
    <div className="mc-ratio-card">
      <div
        className="mc-ratio-card__warn"
        style={{ display: `${props.warn ? "block" : "none"}` }}
      >
        <span style={{ fontSize: 18 }}>警告：</span>
        收报电文中有部分识别概率过低，请通过音频校报进行核准，或者请求对方重发。
      </div>
      <div className="mc-ratio-card__range">
        <div className="mc-ratio-card__title">单组报文准确率</div>
        <div className="mc-ratio-card__item">
          <McIcon color="#88FF09">dot</McIcon>
          <span>97%以上</span>
        </div>
        <div className="mc-ratio-card__item">
          <McIcon color="#FA6400">dot</McIcon>
          <span>80%至90%之间</span>
        </div>
        <div className="mc-ratio-card__item">
          <McIcon color="#F7B500">dot</McIcon>
          <span>90%至97%之间</span>
        </div>
        <div className="mc-ratio-card__item">
          <McIcon color="#E02020">dot</McIcon>
          <span>80%以下</span>
        </div>
      </div>
      <div className="mc-ratio-card__divider" />
      <Radio.Group
        value={props.value}
        onChange={event => props.onChange(event.target.value)}
      >
        <Radio value={MceFlag.Ratio}>显示概率</Radio>
        <Radio value={MceFlag.State}>显示符号</Radio>
      </Radio.Group>
      <div className="mc-ratio-card__intro">
        *当进行收报时会对每组报文的识别准确率打一个标记、以便于对当前报文与抄报进行对比。概率值仅供参考，最终结果以校报后结果为准。
      </div>
    </div>
  );
};

export default McRatioCard;

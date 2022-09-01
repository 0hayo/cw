import "./index.less";
import { Radio } from "antd";
import useBooks from "./useBooks";
import React, { FC } from "react";

interface IProps {
  value: string;
  onChange: (value: string) => void;
}

const McBookRadio: FC<IProps> = props => {
  const books = useBooks();

  return (
    <div className="mc-book-radio">
      <div className="mc-book-radio__hint">
        *通过选择密码本来转换报文，只能选择一种
      </div>
      <div>
        <Radio.Group
          value={props.value}
          onChange={event => props.onChange(event.target.value)}
        >
          {books.map((it, ix) => (
            <div key={ix} className="mc-book-radio__item">
              <Radio value={it.name}>{it.name}</Radio>
            </div>
          ))}
        </Radio.Group>
      </div>
    </div>
  );
};

export default McBookRadio;

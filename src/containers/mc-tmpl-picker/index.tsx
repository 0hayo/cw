import "./index.less";
import { Dropdown } from "antd";
import useData from "./useData";
import isEmpty from "lodash/isEmpty";
import classnames from "classnames";
import McIcon from "components/mc-icon";
import McButton from "components/mc-button";
import React, { FC, useEffect } from "react";

interface IProps {
  name: string;
  type: TelegramBizType;
  onChange: (value: string) => void;
}

const McTmplPicker: FC<IProps> = ({ name: tmplName, type, onChange }) => {
  const [data, shim] = useData(type);

  useEffect(() => {
    if (isEmpty(tmplName)) {
      onChange(shim);
    }
  }, [shim, tmplName, onChange]);

  const overlay = (
    <div className="mc-tmpl-picker__overlay">
      <div className="mc-tmpl-picker__head">
        <span>格式选择</span>
        <McIcon size="18px">close</McIcon>
      </div>
      <ul>
        {data.map((it, ix) => (
          <li
            key={ix}
            className={classnames("mc-tmpl-picker__item", {
              "mc-tmpl-picker__item--active": it.name === tmplName,
            })}
            onClick={() => onChange(it.name)}
          >
            {it.name}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Dropdown overlay={overlay} trigger={["click"]} placement="topLeft">
      <div className="mc-tmpl-picker">
        <McButton icon="format" className="mc-tmpl-picker__button">
          {tmplName ? tmplName : "选择报文格式"}
        </McButton>
      </div>
    </Dropdown>
  );
};

export default McTmplPicker;

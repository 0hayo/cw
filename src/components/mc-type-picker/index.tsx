import "./index.less";
import { Dropdown } from "antd";
import React, { FC } from "react";
import classnames from "classnames";
import McIcon from "components/mc-icon";
import McButton from "components/mc-button";
import DictionaryService from "services/dictionary-service";

interface IProps {
  value: string;
  excludes?: string[];
  onChange: (value: string) => void;
}

const McTypePicker: FC<IProps> = ({ value, excludes = [], onChange }) => {
  const dictItems = DictionaryService.getDictItems("draft_type");
  const overlay = (
    <div className="mc-type-picker__overlay">
      <div className="mc-type-picker__head">
        <span>电报类型</span>
        <McIcon size="18px" color="#fff">
          close
        </McIcon>
      </div>
      <ul>
        {dictItems
          ?.filter(x => excludes.indexOf(x.value) < 0)
          .map(it => (
            <li
              key={it.uuid}
              className={classnames("mc-type-picker__item", {
                "mc-type-picker__item--active": it?.value === value,
              })}
              onClick={() => onChange(it?.value)}
            >
              {it}
            </li>
          ))}
      </ul>
    </div>
  );

  return (
    <Dropdown overlay={overlay} trigger={["click"]} placement="topLeft">
      <div className="mc-type-picker">
        <McButton icon="format" className="mc-type-picker__button">
          {value}
        </McButton>
      </div>
    </Dropdown>
  );
};

export default McTypePicker;

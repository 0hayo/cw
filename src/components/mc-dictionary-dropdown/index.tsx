import "./index.less";
import React, { FC, ReactNode, useState } from "react";
import { Select } from "antd";
import DictionaryService from "services/dictionary-service";

interface IProps {
  /** 数据字典类型，如：draft_type */
  dictType: string;
  defaultValue?: string;
  name?: string;
  enableEmpty?: boolean;
  onChange: (dictItem: DictionaryItem) => void;
  itemDisplay?: (title: string, value: string, desc: string, id: string) => ReactNode;
}
/**
 * 数据字典选择组件
 */
const McDictDropdown: FC<IProps> = ({
  dictType,
  defaultValue = "",
  name = "",
  enableEmpty = true,
  onChange,
  itemDisplay,
}) => {
  const { Option } = Select;
  // 字典选项列表
  const dictItemList = DictionaryService.getDictItems(dictType);
  const [currDictItem, setCurrDictItem] = useState<DictionaryItem>();
  return (
    <div className="mc_dictionary_dropdown">
      <Select
        dropdownClassName="downSelect"
        className="select"
        value={currDictItem?.value || defaultValue}
        onChange={value => {
          const target = dictItemList.find(x => x.value === value);
          setCurrDictItem(target);
          onChange(target);
        }}
      >
        {enableEmpty && <Option value="">请选择{name}</Option>}
        {dictItemList &&
          dictItemList.map(item => (
            <Option value={item.value} key={item.uuid}>
              {itemDisplay ? itemDisplay(item.title, item.value, item.desc, item.uuid) : item.title}
            </Option>
          ))}
      </Select>
    </div>
  );
};

export default McDictDropdown;

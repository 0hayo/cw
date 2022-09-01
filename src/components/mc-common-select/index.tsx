import "./index.less";
import React, { FC, useEffect, useState } from "react";
import { Select } from "antd";
import { isArray } from "lodash";

interface IProps<T> {
  /** 数据对象中表示id的字段名 */
  idPropName: string;
  /** 数据对象中表示值（显示数据）的字段名 */
  valuePropName: string;
  /** 数据集合或获取数据集合的方法 */
  items: () => Promise<T[]> | T[];
  onChange: (item: T) => void;
  itemName?: string;
  allowAll?: boolean;
  selectedId?: string;
  readonly?: boolean;
}

/**
 * 通用下拉列表组件
 */
const McCommonSelect: FC<IProps<any>> = ({
  idPropName,
  valuePropName,
  items,
  onChange,
  itemName = "选项",
  allowAll = true,
  selectedId,
  readonly = false,
}) => {
  const { Option } = Select;
  // 数据列表
  const [itemList, setItemList] = useState<any>(null);
  // 当前选中项
  const [currItem, setCurrItem] = useState(null);

  // 请求数据列表
  useEffect(() => {
    let data = [];
    if (items instanceof Function) {
      (async () => {
        data = await items();
        data &&
          isArray(data) &&
          setItemList(x => data?.sort((a, b) => (a[idPropName] > b[idPropName] ? 1 : -1)));
      })();
    } else {
      data = items;
      data &&
        isArray(data) &&
        setItemList(x => data.sort((a, b) => (a[idPropName] > b[idPropName] ? 1 : -1)));
    }
  }, [setItemList, idPropName, items]);

  /** 如果有传入selectedId, 数据列表加载后，返回对应的数据对象 */
  useEffect(() => {
    if (selectedId && itemList) {
      const item = itemList?.find(x => x[idPropName] + "" === selectedId);
      setCurrItem(item);
    }
  }, [itemList, selectedId, idPropName]);

  return (
    <div className="mc_common_select">
      <Select
        dropdownClassName="downSelect"
        className="select"
        value={currItem ? currItem[idPropName] : ""}
        disabled={readonly}
        onChange={value => {
          const target = itemList.find(x => x[idPropName] === value);
          setCurrItem(target);
          onChange(target);
        }}
      >
        {allowAll && <Option value="">----全部{itemName}----</Option>}
        {!allowAll && (
          <Option value="" disabled>
            ----请选择{itemName}----
          </Option>
        )}
        {itemList &&
          itemList.map(item => (
            <Option value={item[idPropName]} key={item[idPropName]}>
              {item[valuePropName]}
            </Option>
          ))}
      </Select>
    </div>
  );
};

export default McCommonSelect;

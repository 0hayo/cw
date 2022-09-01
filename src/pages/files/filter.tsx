import { Checkbox, Radio, Input } from "antd";
import React, { FC } from "react";
import McBox from "components/mc-box";
import McButton from "components/mc-button";
import SizedBox from "components/sizedbox";
import McDeviceDropdown from "components/mc-devices-dropdown";
import { getAppType } from "misc/env";
// import McDirPicker from "components/mc-dir-picker";
import { SearchOutlined } from "@ant-design/icons";

interface IData {
  keyword: string;
  sortord: "stime" | "name";
  radioUuid: string;
}

interface IProps {
  keyword: string;
  sortord: "stime" | "name";
  checked: number;
  total: number;
  type: string;
  radioUuid: string;
  onExport: (dir: string) => void;
  onDelete: VoidFunction;
  onChange: (data: IData) => void;
  onCheckAll: (flag: boolean) => void;
}

const Filter: FC<IProps> = ({
  keyword,
  sortord,
  checked,
  total,
  type,
  radioUuid,
  onExport,
  onDelete,
  onChange,
  onCheckAll,
}) => {
  return (
    <div className="mc-file-filter">
      <McBox flex="1" display="flex" alignItems="center">
        <Input
          type="search"
          value={keyword}
          className="mc-file-input"
          placeholder="请输入关键字"
          onChange={event => {
            onChange({
              sortord,
              keyword: event.currentTarget.value,
              radioUuid,
            });
          }}
          addonAfter={<SearchOutlined />}
          allowClear
        />
        {getAppType() === "control" && (
          <McDeviceDropdown
            radioUuid={radioUuid}
            onChange={radio => {
              if (radio?.uuid !== radioUuid) {
                onChange({
                  sortord,
                  keyword,
                  radioUuid: radio?.uuid,
                });
              }
            }}
          />
        )}
        <div className="mc-file-label"> </div>
        <Radio.Group
          value={sortord}
          onChange={event => {
            onChange({
              keyword,
              sortord: event.target.value,
              radioUuid,
            });
          }}
        >
          <Radio value="stime">按时间排序</Radio>
          <Radio value="name">按名称排序</Radio>
        </Radio.Group>
      </McBox>
      {checked > 0 && <div>已选: {checked} 项</div>}
      <SizedBox width="24px" />
      <Checkbox
        indeterminate={checked !== total && checked !== 0}
        checked={checked === total && checked !== 0}
        onChange={e => onCheckAll(e.target.checked)}
      />
      &nbsp;&nbsp;全选
      {/*<McDirPicker*/}
      {/*  loading={false}*/}
      {/*  onSelect={path => {*/}
      {/*    onExport(path);*/}
      {/*  }}*/}
      {/*  title="选择导出文件夹"*/}
      {/*  type={type}*/}
      {/*  disabled={checked === 0}*/}
      {/*>*/}
      {/*  导出AI训练文件*/}
      {/*</McDirPicker>*/}
      <SizedBox width="24px" />
      <McButton
        danger
        type="primary"
        icon="delete"
        disabled={checked === 0}
        className="mc-file-picker"
        onClick={onDelete}
      >
        删除已选中报文
      </McButton>
    </div>
  );
};

export default Filter;

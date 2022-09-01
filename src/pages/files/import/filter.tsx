import { Checkbox, Radio } from "antd";
import map from "lodash/map";
import useUpload from "./useUpload";
import McBox from "components/mc-box";
import McIcon from "components/mc-icon";
import SizedBox from "components/sizedbox";
import McFilePicker from "components/mc-file-picker";
import McUploadModal from "containers/mc-upload-modal";
import React, { FC, useState } from "react";
import McDeviceDropdown from "components/mc-devices-dropdown";
import McButton from "components/mc-button";
import { getAppType } from "misc/env";

interface IData {
  keyword: string;
  sortord: "date" | "name";
  radioUuid: string;
}

interface IProps {
  keyword: string;
  sortord: "date" | "name";
  radioUuid: string;
  checked;
  total;
  onChange: (data: IData) => void;
  onUpload: () => void;
  onDelete: VoidFunction;
  onCheckAll: (flag: boolean) => void;
}

const Filter: FC<IProps> = ({
  keyword,
  sortord,
  radioUuid,
  checked,
  total,
  onChange,
  onUpload,
  onDelete,
  onCheckAll,
}) => {
  const [modal, setModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [upload, loading] = useUpload(() => onUpload());

  return (
    <div className="mc-file-filter">
      <McBox flex="1" display="flex" alignItems="center">
        <McIcon className="mc-file-search">search</McIcon>
        <input
          type="search"
          value={keyword}
          className="mc-file-input"
          placeholder="请输入搜索内容"
          onChange={event => {
            onChange({
              sortord,
              keyword: event.currentTarget.value,
              radioUuid,
            });
          }}
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
        <div className="mc-file-label">排序方式: </div>
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
          <Radio value="date">时间</Radio>
          <Radio value="name">名称</Radio>
        </Radio.Group>
      </McBox>
      {checked > 0 && <div>已选择 {checked} 项</div>}
      <SizedBox width="24px" />
      <Checkbox
        indeterminate={checked !== total && checked !== 0}
        checked={checked === total && checked !== 0}
        onChange={e => onCheckAll(e.target.checked)}
      />
      &nbsp;&nbsp;全选
      <SizedBox width="24px" />
      <McButton
        danger
        type="primary"
        icon="delete"
        disabled={checked === 0}
        className="mc-file-picker"
        onClick={onDelete}
      >
        删除文件
      </McButton>
      <SizedBox width="24px" />
      <McFilePicker
        accept=".jpg, .jpeg, .png, .docx, .json"
        loading={loading}
        onFileChange={files => {
          setModal(true);
          setFiles(map(files, x => x));
        }}
      >
        导入文件
      </McFilePicker>
      <McUploadModal
        visible={modal}
        onCancel={() => setModal(false)}
        onSubmit={name => {
          setModal(false);
          upload(name, files);
        }}
      />
    </div>
  );
};

export default Filter;

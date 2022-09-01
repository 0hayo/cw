import "./index.less";
import path from "path";
import React, { FC } from "react";
import { map, uniq } from "lodash";
import message from "misc/message";
import McButton from "components/mc-button";
import { ImportOutlined } from "@ant-design/icons";
import { ButtonProps } from "antd/es/button";

const validate = (files: FileList): boolean => {
  return uniq(map(files, it => path.extname(it.name))).length === 1;
};

interface IProps extends ButtonProps {
  accept: string;
  loading: boolean;
  onFileChange: (files: FileList) => void;
  title?: string;
  multiple?: boolean;
}

const McFilePicker: FC<IProps> = ({
  title = "选择文件",
  onFileChange,
  multiple = true,
  ...props
}) => {
  return (
    <McButton
      type="primary"
      loading={props.loading}
      disabled={props.loading}
      className="mc-file-picker"
      {...props}
    >
      <input
        multiple={multiple}
        type="file"
        title={title}
        accept={props.accept}
        onChange={event => {
          const files = event.target.files;
          if (files && files.length) {
            if (multiple && !validate(files)) {
              message.failure("错误", "检测到您所选的多个文件格式不一致！");
              return;
            }
            onFileChange(files);
          }
          event.target.value = "";
        }}
      />
      <span>{props.children}</span>
      <ImportOutlined />
    </McButton>
  );
};

export default McFilePicker;

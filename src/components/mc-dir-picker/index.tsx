import path from "path";
import os from "os";
import React, { FC } from "react";
import McButton from "components/mc-button";
import { ipcRenderer } from "electron";
import moment from "moment";

interface IProps {
  loading: boolean;
  onSelect: (files: string) => void;
  disabled: boolean;
  title?: string;
  type: string;
}

const McDirPicker: FC<IProps> = ({
  title = "选择文件夹",
  onSelect,
  ...props
}) => {
  return (
    <McButton
      type="primary"
      icon="save"
      loading={props.loading}
      disabled={props.disabled}
      onClick={() => {
        ipcRenderer.removeAllListeners("selectedDir");
        ipcRenderer.send("open-save-dialog", {
          title: "选择导出文件存储路径",
          defaultPath: path.join(
            os.homedir(),
            `export-${props.type}-${moment().format("YYYYMMDD-HHmmss")}`
          ),
        });
        ipcRenderer.on("selectedDir", (event, path) => {
          if (path !== null && path !== undefined) {
            onSelect(path);
          }
        });
      }}
    >
      <span>{props.children}</span>
    </McButton>
  );
};

export default McDirPicker;

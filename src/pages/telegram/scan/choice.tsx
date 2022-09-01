import React, { FC } from "react";
import McIcon from "components/mc-icon";
import { useHistory } from "react-router";
import { Button } from "antd";

const Choice: FC = () => {
  const history = useHistory();

  return (
    <div className="mc-choice">
      <Button type="primary" onClick={() => history.push("/tx/scan?mode=video")}>
        <span>拍照识别</span>
        <McIcon>camera</McIcon>
      </Button>
      <Button type="primary" onClick={() => history.push("/files/import")}>
        <span>文件识别</span>
        <McIcon>file-select</McIcon>
      </Button>
    </div>
  );
};

export default Choice;

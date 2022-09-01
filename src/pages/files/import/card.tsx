import moment from "moment";
import React, { FC } from "react";
import McBox from "components/mc-box";
import useNavigate from "./useNavigate";
import McButton from "components/mc-button";
import IconButton from "components/mc-icon-button";
import { Checkbox } from "antd";

interface IProps {
  folder: McFolderMeta;
  mode?: string;
  checked?: boolean;
  onDelete: VoidFunction;
  onCheck: (folder: McFolderMeta, checked: boolean) => void;
}

const Card: FC<IProps> = ({ folder, mode = "?", checked = false, onCheck, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className={`mc-file-card ${checked ? "mc-file-card__checked" : ""}`}>
      <McBox display="flex">
        <div className="mc-file-card__ext">{mode}</div>
        <div className="mc-file-card__extra"></div>
      </McBox>
      <div className="mc-file-card__name">{folder.name}</div>
      <div>保存时间:</div>
      <div>{moment(folder.date).format("YYYY-MM-DD HH:mm")}</div>
      <div className="mc-file-card__mask">
        <McButton icon="scan" type="primary" onClick={() => navigate(folder.id, folder.mode)}>
          智能识别
        </McButton>
        <div>
          <Checkbox
            className="mc-file-card__check"
            value={folder}
            checked={checked}
            onChange={e => {
              onCheck(folder, e.target.checked);
            }}
          />
          <IconButton onClick={onDelete} className="mc-file-card__delete">
            delete
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default Card;

import moment from "moment";
import React, { FC, useState } from "react";
import { useHistory } from "react-router";
import McButton from "components/mc-button";
import { getAppType } from "misc/env";
import McTaskExecModal from "components/mc-exec-task-modal";
import McTelegramPreview from "components/mc-telegram-preview";
import { Checkbox } from "antd";

interface IProps {
  stat: McTelegramStat;
  checked?: boolean;
  onDelete: VoidFunction;
  onCheck: (folder: McTelegramStat, checked: boolean) => void;
}

const Card: FC<IProps> = ({ stat, checked = false, onCheck, onDelete }) => {
  const history = useHistory();
  const [showExecModal, setShowExecModal] = useState(false);
  const [showPreView, setShowPreview] = useState(false);
  return (
    <div className={`mc-file-card ${checked ? "mc-file-card__checked" : ""}`}>
      {/* <McBox display="flex">
        <div className="mc-file-card__ext">{stat.type === "CCK" ? "CW" : stat.type}</div>
      </McBox> */}
      <div
        className="mc-file-card__title"
        onClick={() => {
          onCheck(stat, !checked);
        }}
      >
        <div className={`file-type ${stat.type === "EX" ? "file-type-ex" : ""}`}>
          {stat.type === "CCK" ? "CW" : stat.type}
        </div>
        <div className="title-icons">
          <Checkbox
            className="check"
            value={stat}
            checked={checked}
            onChange={e => {
              onCheck(stat, e.target.checked);
            }}
          />
        </div>
      </div>
      <div className="mc-file-card__content">
        <div className="mc-file-card__name">{stat.name}</div>
        <div>更新时间:</div>
        <div>{moment(stat.stime).format("YYYY-MM-DD HH:mm")}</div>
        <div className="mc-file-card__mask">
          <McButton icon="search" type="link" size="small" onClick={() => setShowPreview(true)}>
            查看报文
          </McButton>
          <McButton
            icon="edit"
            type="link"
            size="small"
            onClick={() => {
              if (stat.from === "scan") {
                const mode = stat.mode === "PIC" ? "photo" : "docx";
                history.push(
                  `/tx/scan?type=${stat.type}&from=${encodeURIComponent(stat.path)}&mode=${mode}`
                );
              } else {
                history.push(
                  `/telegram/input?type=${stat.type}&from=${encodeURIComponent(
                    stat.path
                  )}&retpath=draft`
                );
              }
            }}
          >
            编辑报文
          </McButton>
          <McButton
            icon="send"
            type="link"
            size="small"
            onClick={() => {
              if (getAppType() === "control") {
                setShowExecModal(true);
              } else {
                history.push(`/cw?dir=${encodeURIComponent(stat.path)}&mode=tx`);
              }
            }}
          >
            前往发报
          </McButton>
        </div>
      </div>

      {showExecModal && (
        <McTaskExecModal
          type="1"
          currTask={{ bizType: stat.type, name: "", title: stat.name, type: "1", completeFlag: 0 }}
          telegram={{ uuid: stat.path, title: stat.name, type: "1" }}
          onCancel={() => setShowExecModal(false)}
        />
      )}
      {showPreView && (
        <McTelegramPreview telegramUuid={stat.path} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
};

export default Card;

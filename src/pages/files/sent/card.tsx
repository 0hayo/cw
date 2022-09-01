import moment from "moment";
import React, { FC, useState } from "react";
import McButton from "components/mc-button";
import { useHistory } from "react-router";
import { Checkbox } from "antd";
import McTelegramPreview from "../../../components/mc-telegram-preview";

interface IProps {
  stat: McTelegramStat;
  checked: boolean;
  onDelete: VoidFunction;
  onCheck: (folder: McTelegramStat, checked: boolean) => void;
}

const Card: FC<IProps> = ({ stat, checked, onDelete, onCheck }) => {
  const history = useHistory();
  const [preview, setPreview] = useState(false);
  return (
    <div className={`mc-file-card-sent ${checked ? "mc-file-card-sent__checked" : ""}`}>
      {/* <McBox display="flex" alignItems="flex-start">
        <div className="mc-file-card-sent__ext">报</div>
      </McBox> */}
      <div
        className="mc-file-card-sent__title"
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
      <div className="mc-file-card-sent__content">
        <div className="mc-file-card-sent__name">{stat.name}</div>
        <div>保存时间:</div>
        <div>{moment(stat.stime).format("YYYY-MM-DD HH:mm")}</div>
        <div className="mc-file-card-sent__mask">
          <McButton type="link" size="small" icon="file-search" onClick={() => setPreview(true)}>
            导出报文
          </McButton>
          <McButton
            type="link"
            size="small"
            icon="file-search"
            onClick={() => {
              // alert(1);
              history.push(
                `/tx/show?mode=tx&datagramType=TELS&type=${
                  stat.type
                }&datagramDraftUuid=${encodeURIComponent(stat.path)}&dir=${encodeURIComponent(
                  stat.path
                )}&scene=regular&receive=false&retpath=send&taskUuid=${encodeURIComponent(
                  stat.taskId
                )}&filetype=send`
              );
              // history.push(
              //     `/cw?mode=tx&datagramType=TELS&type=${
              //         stat.type
              //     }&datagramDraftUuid=${encodeURIComponent(stat.path)}&dir=${encodeURIComponent(
              //         stat.path
              //     )}&scene=regular&receive=false&retpath=send&taskUuid=${encodeURIComponent(
              //         stat.taskid
              //     )}&filetype=send`
              // )
              // history.push(
              //   `/tx/ready?dir=${encodeURIComponent(stat.path)}&from=${encodeURIComponent(
              //     stat.path
              //   )}&retpath=send`
              //   // `/cw?dir=${encodeURIComponent(stat.path)}&from=${encodeURIComponent(stat.path)}`
              // )
            }}
          >
            查看报文
          </McButton>
          <McButton
            type="link"
            size="small"
            icon="printer"
            onClick={() =>
              // history.push(`/rx?dir=${encodeURIComponent(stat.path)}&scene=regular&print=true`)
              history.push(
                `/tx/show?mode=tx&datagramType=TELS&type=${
                  stat.type
                }&datagramDraftUuid=${encodeURIComponent(stat.path)}&dir=${encodeURIComponent(
                  stat.path
                )}&scene=regular&receive=false&retpath=send&print=true&taskUuid=${encodeURIComponent(
                  stat.taskId
                )}&filetype=send`
              )
            }
          >
            打印报文
          </McButton>
        </div>
      </div>
      {preview && <McTelegramPreview telegramUuid={stat.path} onClose={() => setPreview(false)} />}
    </div>
  );
};

export default Card;

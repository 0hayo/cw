import "./card.less";
import moment from "moment";
import React, { FC } from "react";
import Icon from "components/mc-icon";
import { useHistory } from "react-router";
import McButton from "components/mc-button";

interface IProps {
  stat: McTelegramStat;
}

const Card: FC<IProps> = ({ stat }) => {
  const history = useHistory();

  return (
    <div className="mc-send-card">
      <div className="mc-send-card__title">
        <Icon size="4px" color="#F7B500">
          dot
        </Icon>
        <span>{stat.name}</span>
      </div>
      <div className="mc-send-card__extra">
        <div className="mc-send-card__text">待发时间</div>
        <div>
          <div className="mc-send-card__time">{moment(stat.ptime).format("HH: mm")}</div>
          <div className="mc-send-card__date">{moment(stat.ptime).format("YYYY年M月DD日")}</div>
        </div>
      </div>
      <div className="mc-send-card__btns">
        <McButton
          icon="edit"
          type="primary"
          onClick={() => {
            if (stat.from === "scan") {
              const mode = stat.mode === "PIC" ? "photo" : "docx";
              history.push(
                `/tx/scan?type=${stat.type}&from=${encodeURIComponent(stat.path)}&mode=${mode}`
              );
            } else {
              history.push(
                `/telegram/code?type=${stat.type}&from=${encodeURIComponent(stat.path)}`
              );
            }
          }}
        >
          编辑报文
        </McButton>
        <McButton
          icon="send"
          type="primary"
          onClick={() => history.push(`/tx/ready?dir=${encodeURIComponent(stat.path)}`)}
        >
          前往发报
        </McButton>
      </div>
    </div>
  );
};

export default Card;

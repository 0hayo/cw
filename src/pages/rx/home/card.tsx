import "./card.less";
import moment from "moment";
import React, { FC } from "react";
import classnames from "classnames";
import Icon from "components/mc-icon";
import { useHistory } from "react-router";
import McButton from "components/mc-button";

interface IProps {
  stat: McTelegramStat;
}

const Card: FC<IProps> = ({ stat }) => {
  const history = useHistory();

  return (
    <div className="mc-recv-card">
      <div className="mc-recv-card__title">
        <Icon size="4px" color="#F7B500">
          dot
        </Icon>
        <span>{stat.name || "未命名"}</span>
      </div>
      <div className="mc-recv-card__extra">
        <div>
          <div
            className={classnames("mc-recv-card__state", {
              "mc-recv-card__check": stat.state === "check",
              "mc-recv-card__uncheck": stat.state !== "check",
            })}
          >
            {stat.state === "check" ? "已校报" : "未校报"}
          </div>
          {stat.state === "check" && (
            <McButton
              icon="search"
              type="primary"
              onClick={() =>
                history.push(
                  `/rx/ready?dir=${encodeURIComponent(stat.path)}&scene=regular&receive=false`
                )
              }
            >
              查看报文
            </McButton>
          )}
          {stat.state !== "check" && (
            <McButton
              icon="check"
              type="primary"
              onClick={() =>
                history.push(
                  `/rx/ready?dir=${encodeURIComponent(stat.path)}&scene=regular&receive=true`
                )
              }
            >
              继续校报
            </McButton>
          )}
        </div>
        <div>
          <div className="mc-recv-card__text">收报时间</div>
          <div className="mc-recv-card__time">{moment(stat.stime).format("HH: mm")}</div>
          <div className="mc-recv-card__date">{moment(stat.stime).format("YYYY年MM月DD日")}</div>
        </div>
      </div>
    </div>
  );
};

export default Card;

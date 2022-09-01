import moment from "moment";
import React, { FC, useEffect, useState } from "react";
import McButton from "components/mc-button";
import { useHistory } from "react-router";
import { Checkbox } from "antd";
import xmeta from "services/xmeta";
import McTelegramPreview from "components/mc-telegram-preview";
import { MstTheme } from "less/theme";

interface IProps {
  stat: McTelegramStat;
  checked: boolean;
  onDelete: VoidFunction;
  onCheck: (folder: McTelegramStat, checked: boolean) => void;
}

const Card: FC<IProps> = ({ stat, checked, onDelete, onCheck }) => {
  const history = useHistory();
  const [checkStatus, setCheckStatus] = useState(false); //是否完成校报
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    (async () => {
      const meta = await xmeta.readServer(stat.path);
      if ("check" === meta?.state) {
        setCheckStatus(true);
      }
    })();
  }, [stat.path]);

  return (
    <div className={`mc-file-card-recv ${checked ? "mc-file-card-recv__checked" : ""}`}>
      {/* <McBox display="flex" alignItems="flex-start">
        <div className="mc-file-card-recv__ext">{stat.type === "CCK" ? "CW" : stat.type}</div>
        <div>
          <div className="mc-file-card-recv__extra">已收报文</div>
          <div
            className="mc-file-card-recv__extra"
            style={{ color: `${checkStatus ? "green" : "#ff4d4f"}` }}
          >
            {checkStatus ? "已校报" : "未校报"}
          </div>
        </div>
      </McBox> */}
      <div
        className="mc-file-card-recv__title"
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
      <div className="mc-file-card-recv__content">
        <div className="mc-file-card-recv__name">{stat.name || "未命名"}</div>
        <div
          className="mc-file-card-recv__extra"
          style={{ color: `${checkStatus ? MstTheme.mc_green_color : MstTheme.mc_danger_color}` }}
        >
          {checkStatus ? "已校报" : "未校报"}
        </div>
        <div>接收时间:</div>
        <div>{moment(stat.ptime).format("YYYY-MM-DD HH:mm")}</div>
        <div className="mc-file-card-recv__mask">
          <McButton type="link" size="small" icon="search" onClick={() => setPreview(true)}>
            查看报文
          </McButton>
          {checkStatus && (
            <McButton
              type="link"
              size="small"
              icon="file-search"
              onClick={() =>
                // history.push(
                //   `/cw?mode=rx&datagramType=TELR&type=${
                //     stat.type
                //   }&datagramDraftUuid=${encodeURIComponent(stat.path)}&dir=${encodeURIComponent(
                //     stat.path
                //   )}&scene=regular&receive=false&retpath=recv&filetype=recv&taskUuid=${encodeURIComponent(
                //     stat.taskid
                //   )}&retpath=files`
                // )
                history.push(
                  `/rx/show?mode=rx&datagramType=TELR&type=${
                    stat.type
                  }&datagramDraftUuid=${encodeURIComponent(stat.path)}&dir=${encodeURIComponent(
                    stat.path
                  )}&scene=regular&receive=false&retpath=recv&filetype=recv&taskUuid=${encodeURIComponent(
                    stat.taskId
                  )}&retpath=files`
                )
              }
            >
              查看记录
            </McButton>
          )}
          {/*{!checkStatus && (*/}
          {/*  <McButton*/}
          {/*    type="primary"*/}
          {/*    icon="receive"*/}
          {/*    onClick={() =>*/}
          {/*      // history.push(*/}
          {/*      //   `/rx?dir=${encodeURIComponent(stat.path)}&from=${encodeURIComponent(*/}
          {/*      //     stat.path*/}
          {/*      //   )}&scene=ready&receive=true`*/}
          {/*      // )*/}
          {/*      history.push(*/}
          {/*        `/cw?mode=rx&datagramType=TELR&type=${*/}
          {/*          stat.type*/}
          {/*        }&datagramDraftUuid=${encodeURIComponent(stat.path)}&dir=${encodeURIComponent(*/}
          {/*          stat.path*/}
          {/*        )}&scene=ready&receive=true`*/}
          {/*      )*/}
          {/*    }*/}
          {/*  >*/}
          {/*    继续收报*/}
          {/*  </McButton>*/}
          {/*)}*/}
          {!checkStatus && (
            <McButton
              type="link"
              size="small"
              icon="check"
              onClick={
                () =>
                  history.push(
                    `/rx?dir=${encodeURIComponent(stat.path)}&from=${encodeURIComponent(
                      stat.path
                    )}&scene=regular&receive=false&taskUuid=${encodeURIComponent(
                      stat.taskId
                    )}&retpath=${encodeURI("/files/recv")}&fromFile=true`
                  )
                // history.push(
                //   `/rx/show?mode=rx&datagramType=TELR&type=${
                //     stat.type
                //   }&datagramDraftUuid=${encodeURIComponent(stat.path)}&dir=${encodeURIComponent(
                //     stat.path
                //   )}&taskUuid=${encodeURIComponent(
                //     stat.taskid
                //   )}&scene=regular&receive=false&retpath=files&filetype=recv`
                // )
              }
            >
              前往校报
            </McButton>
          )}
          <McButton
            type="link"
            size="small"
            icon="printer"
            onClick={() =>
              // history.push(`/rx?dir=${encodeURIComponent(stat.path)}&scene=regular&print=true`)
              history.push(
                `/rx/show?mode=rx&datagramType=TELR&type=${
                  stat.type
                }&datagramDraftUuid=${encodeURIComponent(stat.path)}&dir=${encodeURIComponent(
                  stat.path
                )}&taskUuid=${encodeURIComponent(
                  stat.taskId
                )}&scene=regular&receive=false&print=true&retpath=files&filetype=recv`
              )
            }
          >
            打印报文
          </McButton>
        </div>
      </div>
      {preview && (
        <McTelegramPreview
          telegramUuid={stat.path}
          types={"regular"}
          onClose={() => setPreview(false)}
        />
      )}
    </div>
  );
};

export default Card;

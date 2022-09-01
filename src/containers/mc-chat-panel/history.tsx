import "./history.less";
import useGuid from "hooks/useGuid";
import classnames from "classnames";
import McIcon from "components/mc-icon";
import React, { FC, useEffect } from "react";
import moment from "moment";
import { SendOutlined } from "@ant-design/icons";
import useAutoHeight from "hooks/useAutoHeight";
import { PlayCircleOutlined } from "@ant-design/icons";
import { MstTheme } from "less/theme";

const Item: FC<{
  message: Message;
  play: boolean;
  onClick: (item: Message) => void;
}> = ({ message, play, onClick }) => {
  return (
    <div
      id={`mc-${message.uuid}`}
      title={message.time}
      style={{ cursor: "pointer" }}
      onClick={() => onClick(message)}
      className={classnames("mc-chat-history__item", {
        "mc-chat-history__item--tx": message.type === "tx",
      })}
    >
      {message.type === "rx" && <SendOutlined rotate={0} style={{ fontSize: 18 }} />}
      <div className="mc-chat-history__inner">
        {message.type === "rx" && (
          <div className="mc-chat-history__audio">
            <span className="mc-chat-history__time">
              {moment(message.time).format("YYYY/MM/DD HH:mm:ss ")}{" "}
            </span>
            {play && (
              <div className="mc-chat-history__voice">
                <PlayCircleOutlined style={{ fontSize: 20, color: MstTheme.mc_primary_color }} />
              </div>
            )}
          </div>
        )}
        {message.type === "tx" && (
          <div className="mc-chat-history__audio">
            <span className="mc-chat-history__time">
              {moment(message.time).format("YYYY/MM/DD HH:mm:ss ")}{" "}
            </span>
            {play && (
              <div className="mc-chat-history__voice">
                <PlayCircleOutlined style={{ fontSize: 20, color: MstTheme.mc_primary_color }} />
              </div>
            )}
          </div>
        )}
        <div
          className={classnames("mc-chat-history__text", {
            "mc-chat-history__text--tx": message.type === "tx",
          })}
        >
          {message.value.replace(/,/g, "") + " "}
          {message.canceled && (
            <>
              {/* <McIcon color="red">pause-circle</McIcon> */}
              <span style={{ color: "gray", wordBreak: "break-word" }}>
                {message.left?.replace(/,/g, "")}
              </span>
            </>
          )}
          {message.sendStatus && !message.complete && (
            <div style={{ fontSize: "12px", color: "white" }}>
              点击发送：
              <McIcon color="red">send </McIcon>
            </div>
          )}

          {!message.complete &&
            !message.sendStatus &&
            (message.type === "rx" ? <SendOutlined rotate={180} /> : <SendOutlined />)}
        </div>
      </div>
      {message.type === "tx" && (
        <SendOutlined rotate={180} style={{ fontSize: 18, color: MstTheme.mc_primary_color }} />
      )}
    </div>
  );
};

const McChatHistory: FC<{
  feed: Message;
  feedRx: Message;
  data: Message[];
  panelId: string;
  play: boolean;
  onClick: (item: Message, showFlag?: Boolean) => void;
}> = props => {
  const guid = useGuid();
  useEffect(() => {
    const dom = document.getElementById(`mc-${guid}`);
    if (dom) {
      dom.scrollTop = dom.scrollHeight;
    }
  }, [guid, props.data, props.feed, props.feedRx]);

  const height = useAutoHeight(props.panelId, 200);

  return (
    <div className="mc-chat-history" style={{ height: height }}>
      <div id={`mc-${guid}`} className="mc-chat-history__list">
        {props.data.map(
          it =>
            !it.sendStatus && (
              <Item
                key={it.uuid}
                message={it.uuid === props.feed.uuid ? props.feed : it}
                // message={it}
                onClick={props.onClick}
                play={props.play}
              />
            )
        )}
        {/*{props.data.map(it => (*/}
        {/*   <Item*/}
        {/*      key={it.uuid}*/}
        {/*      // message={ it.uuid === props.feed.uuid ? props.feed : it}*/}
        {/*      message={it}*/}
        {/*      onClick={props.onClick}*/}
        {/*      play={true}*/}
        {/*    />*/}
        {/*    )*/}
        {/*)}*/}
        {/** Feed */}
        {props.feed && props.feed.value !== "" && (
          <Item key={props.feed.uuid} play={false} message={props.feed} onClick={props.onClick} />
        )}

        {props.feedRx && props.feedRx.value !== "" && (
          <Item
            key={props.feedRx.uuid}
            play={false}
            message={props.feedRx}
            onClick={props.onClick}
          />
        )}

        {props.data.map(
          it =>
            it.sendStatus && (
              <Item
                key={it.uuid}
                message={it.uuid === props.feed.uuid ? props.feed : it}
                // message={it}
                onClick={it => {
                  // alert(1);
                  props.onClick(it);
                }}
                play={props.play}
              />
            )
        )}
      </div>
    </div>
  );
};

export default McChatHistory;

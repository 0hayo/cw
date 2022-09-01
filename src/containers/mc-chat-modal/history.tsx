import "./history.less";
import React, { FC } from "react";
import classnames from "classnames";
import moment from "moment";
import { PlayCircleOutlined } from "@ant-design/icons";
import { MstTheme } from "less/theme";
import { SendOutlined } from "@ant-design/icons";

const Item: FC<{
  active: boolean;
  message: Message;
  onClick?: () => void;
}> = ({ active, message, onClick }) => {
  return (
    <div
      id={`mc-modal-item-${message.uuid}`}
      onClick={onClick}
      className={classnames("mc-chat-history__item", {
        "mc-chat-history__item--tx": message.type === "tx",
      })}
    >
      {message.type === "rx" && <SendOutlined rotate={0} style={{ fontSize: 18 }} />}
      <div className="mc-chat-history__inner">
        {message.type === "rx" && (
          <div
            className={classnames("mc-chat-history__audio", {
              "mc-chat-history__audio--active": active,
            })}
          >
            <span className="mc-chat-history__time">
              {moment(message.time).format("YYYY/MM/DD HH:mm:ss ")}{" "}
            </span>
            <PlayCircleOutlined style={{ fontSize: 20, color: MstTheme.mc_primary_color }} />
          </div>
        )}
        {message.type === "tx" && (
          <div className="mc-chat-history__audio">
            <span className="mc-chat-history__time">
              {moment(message.time).format("YYYY/MM/DD HH:mm:ss ")}{" "}
            </span>
            <PlayCircleOutlined style={{ fontSize: 20, color: MstTheme.mc_primary_color }} />
          </div>
        )}
        <div
          className={classnames("mc-chat-history__text", {
            "mc-chat-history__text--tx": message.type === "tx",
            "mc-chat-history__text--active": active,
          })}
        >
          {message.value.replace(/,/g, "")}
          {message.canceled && (
            <>
              {/* <McIcon color="red">pause-circle</McIcon> */}
              <span style={{ color: "gray" }}>{message.left?.replace(/,/g, "")}</span>
            </>
          )}
          {!message.complete && (message.type === "rx" ? " >>>收" : " <<<发")}
        </div>
      </div>
      {message.type === "tx" && (
        <SendOutlined rotate={180} style={{ fontSize: 18, color: MstTheme.mc_primary_color }} />
      )}
    </div>
  );
};

const McChatHistory: FC<{
  uuid?: string;
  feed: Message;
  data: Message[];
  onClick?: (message: Message) => void;
}> = props => {
  return (
    <div id={`mc-modal-${props.uuid ? props.uuid : "modal-history"}`} className="mc-chat-history">
      {props.data.map(it => (
        <Item
          key={it.uuid}
          active={it.uuid === props.uuid}
          message={it}
          onClick={() => {
            if (it.path && props.onClick) {
              props.onClick(it);
            }
          }}
        />
      ))}
      {/** Feed */}
      {props.feed && props.feed.value !== "" && (
        <Item
          key={props.feed.uuid}
          active={props.feed.uuid === props.uuid}
          message={props.feed}
          onClick={() => {
            if (props.feed.path && props.onClick) {
              props.onClick(props.feed);
            }
          }}
        />
      )}
    </div>
  );
};

export default McChatHistory;

import "./index.less";
import React, { FC, useState } from "react";
import usePlayer, { Voice } from "./usePlayer";
import { Dropdown, Menu } from "antd";
import Icon from "components/mc-icon";
import { UpOutlined } from "@ant-design/icons";
import McButton from "components/mc-button";
import guid from "misc/guid";

interface IProps {
  name: string;
  setData: () => { data: McTelegramHash; offset: number };
  onPlay: (offset: number) => void;
  onStop: () => void;
}

const McVoicePlayer: FC<IProps> = ({ name = "语音播报", setData, onPlay, onStop }) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [defVoice, setDefVoice] = useState<Voice>({ path: "", name: "" });
  const player = usePlayer(setVoices, setPlaying, setDefVoice, onPlay, onStop);

  const overlay = (
    <Menu>
      {voices.map(it => {
        return (
          <Menu.Item
            key={guid()}
            onClick={() => {
              const info = setData();
              player.play(info.data, info.offset, it);
            }}
          >
            {it.name}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <div className="mc-voice-player">
      {!playing && (
        <Dropdown.Button
          className="mc-voice-player__main-btn"
          size="middle"
          type="primary"
          icon={<UpOutlined />}
          placement="topLeft"
          onClick={() => {
            const info = setData();
            player.play(info.data, info.offset, defVoice);
          }}
          overlay={overlay}
          style={{ marginLeft: 0 }}
        >
          <span>{name}</span>
          <Icon size="large">voice</Icon>
        </Dropdown.Button>
      )}
      {playing && (
        <McButton
          danger
          icon="pause"
          type="primary"
          onClick={() => {
            player.stop();
          }}
        >
          停止播报
        </McButton>
      )}
    </div>
  );
};

export default McVoicePlayer;

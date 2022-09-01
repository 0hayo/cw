import "./index.less";
import React, { FC } from "react";
import McIconButton from "components/mc-icon-button";

interface IProps {
  played: number;
  active: boolean;
  onPlay: VoidFunction;
  onStop: VoidFunction;
}

const McAudioPlayer: FC<IProps> = ({ active, played, onPlay, onStop }) => {
  return (
    <div className="mc-audio-player">
      {active ? (
        <McIconButton iconSize="21px" onClick={onStop}>
          pause-circle
        </McIconButton>
      ) : (
        <McIconButton iconSize="21px" onClick={onPlay}>
          play
        </McIconButton>
      )}
      <div className="mc-audio-player__duration">
        <div
          className="mc-audio-player__played"
          style={{
            width: `${played}%`,
          }}
        />
      </div>
    </div>
  );
};

export default McAudioPlayer;

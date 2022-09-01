import "./index.less";
import React, {
  FC,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import McModalNice from "components/mc-modal-nice";

interface IProps {}

const McAudioRegulator: FC<IProps> = ({}) => {
  return (
    <McModalNice>
      <div className="mc_audio_regulator"></div>
    </McModalNice>
  );
};

export default McAudioRegulator;

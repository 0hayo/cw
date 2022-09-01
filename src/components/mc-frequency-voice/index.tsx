import "./index.less";
import React, { FC } from "react";
import useGuid from "hooks/useGuid";
import useAudio from "./useAudio";
// import {HtiCanvs,} from "./ElementComponents";
import styled from "styled-components";

interface IProps {
  width?: string;
  height?: string;
}

const HtiCanvs = styled.canvas.attrs(props => ({
  width: props.width || "200px",
  height: props.height || "40px",
}))`
  width: ${props => props.width};
  height: ${props => props.height};
`;

const McFrequencyVoice: FC<IProps> = ({ width, height }) => {
  const guid = useGuid();
  useAudio(guid);
  return (
    <>
      <HtiCanvs id={`mc-${guid}`} width={width} height={height} />
      {/* <canvas id={`mc-${guid}`} className="mc-frequency__canvas" /> */}
      {/* <div className="mc-frequency__status">
        {audio ? "有音频输入" : "无音频输入"}
      </div> */}
    </>
  );
};

export default McFrequencyVoice;

import exec from "services/exec";
import useGuid from "hooks/useGuid";
import React, { FC, useEffect } from "react";
import messenger from "misc/message";
import useMounted from "hooks/useMounted";

interface IProps {
  file?: string;
  message?: Message;
  /** 从第几个字符开始 */
  position?: number;
}
/** 向前的偏移量 */
// const PRE_OFFSET = 0 * 1000 * 16;
// const PRE_OFFSET = 0 * 1000 * 16;
/** 向后的偏移量 */
const CUT_LENGTH = 0 * 1000 * 16;
// const CUT_LENGTH = 6 * 1000 * 16;

const McSpect: FC<IProps> = ({ file, message, position }) => {
  const guid = useGuid();
  const mounted = useMounted();

  useEffect(() => {
    const div = document.getElementById(`mc-${guid}`);

    // const spectImage = document.getElementById("spectImage");
    if (div) {
      div.style.backgroundImage = "none";
    }

    if (file && message && message.offset !== undefined && message.length) {
      //根据指定的字符位置，确定语谱图的开始位置
      const originCharArr = message.origin?.text.split("");
      const originOffsets: number[] = [];
      originCharArr?.map((x, i) => {
        if (x !== ",") {
          // originOffsets.push(message.origin?.offsets[i] ? message.origin?.offsets[i] : 0);
          originOffsets.push(message.origin?.offsets[i]);
        }
        return x;
      });
      // alert(message.origin?.offsets.length);
      // alert(position);
      // alert(message.origin?.offsets[position]);
      // const charOffset =
      //   originOffsets[position && !isNaN(position) ? (position - 1 > 0 ? position - 1 : 0) : 0];
      // const charOffset = originOffsets[position];
      // const offset = isNaN(charOffset) || charOffset - PRE_OFFSET < 0 ? 0 : charOffset - PRE_OFFSET;
      const offset = message.origin?.offsets[position];
      const length = CUT_LENGTH;
      console.log("message=", message);
      // exec(`spectrogram -file ${message.path} -offset ${offset} -length ${length}`, {
      // alert(offset);
      exec(`spectrogram -file ${file} -offset ${offset} -length ${length}`, {
        onData: payload => {
          console.log("Spectrogram=", payload);
          if (mounted.current && payload.tag === "Spectrogram") {
            if (div) {
              // div.style.backgroundImage = `url(${payload.data})`;
              div.innerHTML = `<img src=${payload.data} width="950px" height="200px"/>`;
              // spectImage.src = payload.data;
            }
          }
        },
        onError: () => {
          if (mounted.current) {
            messenger.failure("语谱图", "连接错误");
          }
        },
      });
    }
  }, [guid, file, message, mounted, position]);

  return (
    <div
      id={`mc-${guid}`}
      style={{
        width: "100%",
        height: "200px",
        margin: "0 auto 18px",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <img id="spectImage" alt="语谱图" />
    </div>
  );
};

export default McSpect;

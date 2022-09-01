import exec from "services/exec";
import message from "misc/message";
import useGuid from "hooks/useGuid";
import useMounted from "hooks/useMounted";
import React, { FC, useEffect } from "react";

interface IProps {
  file?: string;
  word?: McTelegramWord;
}

const McSpect: FC<IProps> = ({ file, word }) => {
  const guid = useGuid();
  const mounted = useMounted();

  useEffect(() => {
    const div = document.getElementById(`mc-${guid}`);
    if (div) {
      if (file && word && word.offset && word.length) {
        exec(`spectrogram -file ${file} -offset ${word.offset} -length ${word.length}`, {
          onData: payload => {
            if (mounted.current && payload.tag === "Spectrogram") {
              if (div) {
                div.style.backgroundImage = `url(${payload.data})`;
              }
            }
          },
          onError: () => {
            if (mounted.current) {
              message.failure("语谱图", "连接错误");
              div.style.backgroundImage = "none";
            }
          },
        });
      } else {
        div.style.backgroundImage = "none";
      }
    }
  }, [guid, file, word, mounted]);

  return (
    <div
      id={`mc-${guid}`}
      style={{
        width: "1522px",
        height: "257px",
        margin: "0 auto 18px",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

export default McSpect;

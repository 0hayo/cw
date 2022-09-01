import path from "path";
import fs from "fs";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { ChildProcess, spawn } from "child_process";
import { kWorkSpace } from "misc/env";
import message from "misc/message";
import { max } from "misc/telegram";

const exe = path.join(kWorkSpace, "bin", "telephonytts.exe");
const voicePkgs = path.join(kWorkSpace, "tts");

export interface Voice {
  path: string;
  name: string;
}

const usePlayer = (
  setVoices: Dispatch<SetStateAction<Voice[]>>,
  setPlaying: Dispatch<SetStateAction<boolean>>,
  setDefVoice: Dispatch<SetStateAction<Voice>>,
  onPlay: (offset: number) => void,
  onStop: () => void
): {
  play: (data: McTelegramHash, offset: number, voice: Voice) => void;
  stop: () => void;
} => {
  const childProc = useRef<ChildProcess>();
  // const spawn = require('child_process').spawn;
  //加载语音包
  useEffect(() => {
    try {
      const dirs = fs.readdirSync(voicePkgs);
      const voices: Voice[] = [];
      dirs.map(it => {
        const pkgPath = path.join(voicePkgs, it);
        const stat = fs.statSync(pkgPath);
        if (stat.isDirectory()) {
          const meta = path.join(pkgPath, "meta.json");
          if (fs.existsSync(meta)) {
            const json = JSON.parse(fs.readFileSync(meta).toString());
            voices.push({
              path: pkgPath,
              name: json.name,
            });
          }
        }
        return it;
      });
      setVoices(voices);
      voices && setDefVoice(voices[0]);
    } catch (e) {
      message.failure("错误", "加载语音包失败。");
      console.error("加载语音包失败", e);
    }
  }, [setVoices, setDefVoice]);

  /** 从指定的offset播放给定的报文组 */
  const play = useCallback(
    async (data: McTelegramHash, offset: number, voice: Voice) => {
      setDefVoice(voice);
      setPlaying(true);
      try {
        if (childProc.current && !childProc.current.killed) {
          childProc.current.kill();
        }
        //调用播放语音的工具
        const cmd = `${exe}`;
        childProc.current = spawn(cmd, [
          "-file",
          "stdin",
          "-profile",
          voice.path,
        ]);

        //clip用于记录播放字符索引和电文索引的关系
        const clip: { [index: number]: number } = {};

        //当播放命令通过stdout输出字符串索引时，调用onPlay，将播放进度反馈给调用者
        childProc.current.stdout?.on("data", data => {
          const strIdx = parseInt(data);
          const _offset = clip[strIdx];
          !isNaN(_offset) && onPlay(_offset);
        });
        //播放结束时设置播放按钮状态、释放资源
        childProc.current.stdout?.on("close", (code: string) => {
          setPlaying(false);
          childProc.current?.kill();
          onStop();
        });

        //格式化要朗读的电文，并记录下对应的offset
        const maxIdx = max(data);
        let text = "";
        for (let i = offset; i <= maxIdx; i++) {
          const t = data[i];
          const idx = text.length;
          let str = "";
          clip[idx] = i;
          if (t) {
            str = t.value + " ";
          } else {
            str = " "; //对于空电文，用1个空格代替
          }
          childProc.current.stdin?.write(str);
          text += str;
        }
        childProc.current.stdin?.end(); //此处触发播放
      } catch (e) {
        childProc.current?.kill();
        setPlaying(false);
        message.failure("语音播报失败。");
        console.error(e);
      } finally {
      }
    },
    [setDefVoice, setPlaying, onPlay, onStop]
  );
  /** 停止播放 */
  const stop = useCallback(async () => {
    if (childProc.current && !childProc.current.killed) {
      childProc.current.kill();
    }
    setPlaying(false);
    onStop();
  }, [setPlaying, onStop]);

  //组件卸载时杀掉child_process，停止播放
  useEffect(() => {
    return () => {
      if (childProc.current && !childProc.current.killed) {
        childProc.current.kill();
      }
    };
  }, []);

  return {
    play,
    stop,
  };
};

export default usePlayer;

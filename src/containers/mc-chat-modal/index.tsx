import "./index.less";
import McText from "./text";
// import McGraph from "./graph";
import McSpect from "./spect";
import usePlayer from "./useNewPlayer";
import McChatHistory from "./history";
import McBox from "components/mc-box";
import McButton from "components/mc-button";
// import McChatPhrase from "containers/mc-chat-phrase";
import McAudioPlayer from "components/mc-audio-player";
import React, { FC, useState, useEffect } from "react";
import McModalNice from "components/mc-modal-nice";
// import useAudioSpeaker from "components/mc-audio-speaker/useAudioSpeaker";

interface IProps {
  uuid?: string;
  file?: string;
  type: "tx" | "rx";
  hint: Array<{
    label: string;
    value: string;
  }>;
  visible: boolean;
  disabled: boolean;
  messages: Message[];
  feed: Message;
  onCancel: VoidFunction;
  onLaunch: (text: string) => void;
  onChange: (uuid: string, text: string) => void;
}

const McChatModal: FC<IProps> = props => {
  const player = usePlayer();
  const [text, setText] = useState("");
  const [uuid, setUuid] = useState(props.uuid);
  const [found, setFound] = useState<Message>();
  // const [foundRx, setFoundRx] = useState<Message>();
  const [position, setPosition] = useState(0);

  // const [playing, setPlaying] = useState(false);
  // const onStop = useCallback(() => {
  //   setPlaying(false);
  // }, []);
  // const { startListen,stopListen, play, stop, getDuration } = useAudioSpeaker(onStop);

  useEffect(() => setUuid(props.uuid), [props.uuid]);

  useEffect(() => {
    let _found = props.messages.find(x => x.uuid === uuid);
    if (!_found) {
      _found = props.feed.uuid === uuid ? props.feed : undefined;
    }
    if (_found) {
      setFound(_found);
      // setFoundRx(_found.type === "tx" && props.messages.length > 0 ? getFound() : _found);
    }
    // eslint-disable-next-line
  }, [uuid, props.feed, props.messages]);

  useEffect(() => {
    if (found) {
      setText(found.value);
    }
  }, [found]);

  useEffect(() => {
    const container = document.getElementById(`mc-modal-${uuid}`);
    const dom = document.getElementById(`mc-modal-item-${uuid}`);
    if (container && dom) {
      container.scrollTop = dom.offsetTop;
    }
  }, [uuid]);

  // const getFound = (i = 0) => {
  //   if (props.messages[i].type === "rx") {
  //     return props.messages[i];
  //   } else {
  //     getFound(i++);
  //   }
  // };

  return (
    <McModalNice
      width="100%"
      title="沟通查看"
      footer={null}
      visible={props.visible}
      closable={false}
      onCancel={() => {
        player.stop();
        props.onCancel();
      }}
      maskClosable={false}
      destroyOnClose={true}
      className="mc-chat-modal"
    >
      <McChatHistory
        uuid={uuid}
        data={props.messages}
        feed={props.feed}
        onClick={it => {
          // if (it.type === "rx") {
          setUuid(it.uuid);
          // }
        }}
      />
      <div className="mc-chat-modal__flex">
        {/*<McSpect file={props.file} message={found} position={position} />*/}
        <McSpect file={found?.path} message={found} position={position} />
        {/*<McGraph message={found} />*/}
        <McAudioPlayer
          active={player.active}
          played={player.played}
          onStop={player.stop}
          // onStop={
          //   ()=>{
          //       player.stop();
          //       stopListen();
          //     }
          // }
          // onPlay={()=>{
          //
          //
          //   player.active = true;
          //   startListen();
          //
          // }}
          onPlay={() => {
            player.stop();
            if (found && found.path && found.offset !== undefined && found.length) {
              player.play(found.path, found.offset, found.length);
            }
          }}
        />
        <McText
          text={text}
          origin={found && found.origin?.text}
          onChange={text => setText(text)}
          onSelect={(text, position) => {
            setPosition(position);
            const originCharArr = found.origin?.text.split("");
            const originOffsets: number[] = [];
            originCharArr?.map((x, i) => {
              if (x !== ",") {
                originOffsets.push(found.origin?.offsets[i] ? found.origin?.offsets[i] : 0);
              }
              return x;
            });
            /** 向前的偏移量 */
            // const PRE_OFFSET = 0 * 1000 * 16;
            /** 向后的偏移量 */
            // const CUT_LENGTH = 6 * 1000 * 16;

            // const charOffset =
            //   originOffsets[
            //     position && !isNaN(position) ? (position - 1 > 0 ? position - 1 : 0) : 0
            //   ];
            // const offset =
            //   isNaN(charOffset) || charOffset - PRE_OFFSET < 0 ? 0 : charOffset - PRE_OFFSET;
            // let founds = found.type === "tx" ? getFound() : found;
            const offset = found.origin?.offsets[position];
            player?.stop();

            player.play(found.path, offset, found.length);
          }}
        />
        <McBox textAlign="center">
          {/*<McButton*/}
          {/*  type="primary"*/}
          {/*  onClick={() => {*/}
          {/*    if (found && found.value !== text) {*/}
          {/*      props.onChange(found.uuid, text ? text : found.crude);*/}
          {/*    }*/}
          {/*    player.stop();*/}
          {/*    props.onCancel();*/}
          {/*  }}*/}
          {/*>*/}
          {/*  确定*/}
          {/*</McButton>*/}
          <McButton
            type="primary"
            // className="btn-back"
            onClick={() => {
              player?.stop();
              props.onCancel();
            }}
          >
            关闭
          </McButton>
        </McBox>
      </div>
      {/* <McChatPhrase
        value=""
        hint={props.hint}
        type={props.type}
        onLaunch={props.onLaunch}
        disabled={props.disabled}
        history={props.messages.filter(x => x.type === "tx").reverse()}
      /> */}
    </McModalNice>
  );
};

export default McChatModal;

import "./index.less";
// import McGraph from "./graph";
import McTable from "./table";
// import McSpect from "./spect";
import McSpect from "containers/mc-chat-modal/spect";
// import { Checkbox } from "antd";
import useForm from "./useForm";
import useCheck from "./useCheck";
// import usePlayer from "./usePlayer";
import usePlayer from "containers/mc-chat-modal/useNewPlayer";
// import { index2field } from "misc/util";
import McBox from "components/mc-box";
import McModal from "components/mc-modal";
import McButton from "components/mc-button";
import React, { FC, useEffect, useState } from "react";
import McAudioPlayer from "components/mc-audio-player";
// import McAudioPlayer from "components/mc-audio-player";

interface IProps {
  file?: string;
  head: McTelegramHash;
  body: McTelegramHash;
  role: "head" | "body";
  type: TelegramBizType;
  offset: number;
  count: number;
  visible: boolean;
  onCancel: VoidFunction;
  onChange: (role: "head" | "body", field: string, value: string) => void;
}

const McChatModal: FC<IProps> = props => {
  // const player = usePlayer(props.count);
  const player = usePlayer();
  const [form, setForm] = useForm(props.role, props.offset);
  // const field = index2field(form.offset + form.active, props.type, form.role);
  const check = useCheck(setForm);
  // const found = props[form.role][field];

  const [found] = useState<Message>();
  const [position] = useState(0);

  useEffect(() => {
    setForm(x => ({
      ...x,
      active: 0,
      role: props.role,
      offset: props.offset,
    }));
  }, [props.role, props.offset, setForm]);

  return (
    <McModal
      width="100%"
      title="音频校报"
      footer={null}
      visible={props.visible}
      closable={false}
      onCancel={() => {
        player.stop();
        props.onCancel();
      }}
      maskClosable={false}
      destroyOnClose={true}
      className="mc-code-modal"
      centered={true}
    >
      {/*<McSpect word={found} file={props.file} />*/}
      <McSpect file={found?.path} message={found} position={position} />
      {/*<McGraph word={found} />*/}
      <McBox width="936px" margin="0 auto" position="relative">
        {/*<McAudioPlayer*/}
        {/*  active={player.active}*/}
        {/*  played={player.played}*/}
        {/*  onStop={player.stop}*/}
        {/*  onPlay={() => {*/}
        {/*    // 连续播放*/}
        {/*    // if (props.file && form.auto && form.role === "body") {*/}
        {/*    if (props.file && form.auto) {*/}
        {/*      player.pipe(*/}
        {/*        props.file,*/}
        {/*        form.role,*/}
        {/*        props.type,*/}
        {/*        props[form.role],*/}
        {/*        form.offset + form.active,*/}
        {/*        (offset, active) => {*/}
        {/*          setForm(x => ({*/}
        {/*            ...x,*/}
        {/*            offset,*/}
        {/*            active: active,*/}
        {/*          }));*/}
        {/*        }*/}
        {/*      );*/}
        {/*      return;*/}
        {/*    }*/}
        {/*    // 单个播放*/}
        {/*    if (props.file && found) {*/}
        {/*      player.play(props.file, found);*/}
        {/*      return;*/}
        {/*    }*/}
        {/*  }}*/}
        {/*/>*/}
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
        <McTable
          type={props.type}
          role={form.role}
          hash={props[form.role]}
          active={form.active}
          offset={form.offset}
          count={props.count}
          onChange={props.onChange}
          onPrev={() => {
            player.stop();
            check.handlePrev();
          }}
          onNext={() => {
            player.stop();
            check.handleNext();
          }}
          onActive={index => {
            player.stop();
            check.handleActive(index);
          }}
          onLocate={value => {
            player.stop();
            check.handleLocate(value);
          }}
        />
        <McBox
          display="flex"
          position="relative"
          marginTop="16px"
          flexDirection="row"
          justifyContent="center"
        >
          <McBox color="#32C5FF" fontSize="12px">
            <div>* 输入报文位置并回车，可以快速定位报文，例如：</div>
            <div style={{ paddingLeft: 16 }}> - 输入PTR可以定位报头</div>
            <div style={{ paddingLeft: 16 }}> - 输入1P10W可以定位第1页第10组</div>
          </McBox>
          <McBox right="0" position="absolute">
            <McButton
              type="primary"
              onClick={() => {
                player.stop();
                props.onCancel();
              }}
            >
              返回
            </McButton>
          </McBox>
        </McBox>

        {/* {form.role === "body" && ( */}
        {/*<Checkbox*/}
        {/*  checked={form.auto}*/}
        {/*  onChange={event => {*/}
        {/*    player.stop();*/}
        {/*    setProp("auto")(event.target.checked);*/}
        {/*  }}*/}
        {/*>*/}
        {/*  连续播放*/}
        {/*</Checkbox>*/}
        {/* )} */}
      </McBox>
    </McModal>
  );
};

export default McChatModal;

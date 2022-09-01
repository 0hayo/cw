import "./index.less";
import useForm from "./useForm";
import React, { FC } from "react";
import McChatHistory from "./history";
import McChatModal from "containers/mc-chat-modal";
import McChatPhrase from "containers/mc-chat-phrase-db";
import MstPanel from "components/mst-panel/index";
import useGuid from "../../hooks/useGuid";

interface IProps {
  text: string;
  feed: Message;
  feedRx: Message;
  type: "tx" | "rx";
  file?: string;
  hint: Array<{
    label: string;
    value: string;
  }>;
  messages: Message[];
  play: boolean;
  disabled?: boolean;
  chat?: boolean;
  onClose: VoidFunction;
  onLaunch: (text: string) => void;
  onGoSend?: (message: Message) => void;
  onChange: (uuid: string, text: string) => void;
  frequencyFlag?: boolean;
}

const McChatPanel: FC<IProps> = ({
  type,
  feed,
  feedRx,
  text,
  file,
  hint,
  onClose,
  onLaunch,
  onChange,
  onGoSend,
  messages,
  play,
  disabled = false,
  chat = true,
  frequencyFlag = true,
}) => {
  const [form, setForm] = useForm();
  const guid = useGuid();
  return (
    <MstPanel
      title="联络记录"
      header={false}
      className="mc-chat-panel"
      id={`mc-chat-panel-${guid}`}
    >
      {/* <div className="mc-frequency-wrapper">
        {frequencyFlag ? <McFrequencyView setting={true} view="waveSurfer"/> : <div className="chat-title">联络记录</div>}
      </div> */}
      <McChatHistory
        panelId={`mc-chat-panel-${guid}`}
        feed={feed}
        feedRx={feedRx}
        data={messages}
        play={play}
        onClick={it => {
          if (it.path && play) {
            setForm({
              ...form,
              uuid: it.uuid,
              modal: true,
            });
          } else {
            type === "tx" && onGoSend && onGoSend(it);
          }
        }}
      />
      {chat && (
        <McChatPhrase
          type={type}
          value={text}
          hint={hint}
          onLaunch={onLaunch}
          disabled={disabled}
          history={messages.filter(x => x.type === "tx").reverse()}
        />
      )}
      <McChatModal
        type={type}
        file={file}
        hint={hint}
        uuid={form.uuid}
        visible={form.modal}
        disabled={disabled}
        messages={messages}
        feed={feed}
        onLaunch={onLaunch}
        onChange={onChange}
        onCancel={() => {
          setForm({
            ...form,
            modal: false,
          });
        }}
      />
    </MstPanel>
  );
};

export default McChatPanel;

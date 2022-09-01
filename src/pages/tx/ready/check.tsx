import "./indexcw.less";
import React, { FC, Dispatch, SetStateAction, useState } from "react";
import Modal from "components/mc-modal";
import McBox from "components/mc-box";
import McButton from "components/mc-button";
import McEditor from "components/mc-editor";
import { IForm } from "./typing";
import { MceFlag, MceMenu } from "mce/typing";
// import McVoicePlayer from "components/mc-voice-player";
// import usePlayer from "./usePlayer";
import { Pagination } from "antd";
import McAlign from "components/mc-align";
import useCheckEditor from "./useCheckEditor";
import McIcon from "components/mc-icon";
import McExEditor from "components/mc-ex-editor";

interface IProps {
  visible: boolean;
  loading?: boolean;
  form: IForm;
  setForm: Dispatch<SetStateAction<IForm>>;
  onCancel: () => void;
  title?: string;
}

const McTxCheckModal: FC<IProps> = ({
  visible = false,
  loading = false,
  form,
  setForm,
  onCancel,
  title = "检查报底",
}) => {
  // const { onPlay, onStop } = usePlayer(setForm);
  const [image] = useState(true);
  const editor = useCheckEditor(setForm);

  const footer = (
    <div className="mc-menu">
      <McBox flex="1">
        <McAlign align="left">
          {form.type !== "EX" && (
            <Pagination
              pageSize={100}
              showSizeChanger={false}
              total={form.check.size}
              current={form.check.page}
              onChange={page => {
                setForm(form => ({
                  ...form,
                  check: {
                    ...form.check,
                    page: page,
                  },
                }));
              }}
            />
          )}
        </McAlign>
      </McBox>
      <div></div>
      <McAlign align="right">
        {/*{form.type !== "EX" && (*/}
        {/*  <McButton*/}
        {/*    style={{ marginRight: 24 }}*/}
        {/*    key="img"*/}
        {/*    type="ghost"*/}
        {/*    onClick={() => setImage(!image)}*/}
        {/*  >*/}
        {/*    {image ? "隐藏扫描底图" : "显示扫描底图"}*/}
        {/*    <McIcon size="large">photo</McIcon>*/}
        {/*  </McButton>*/}
        {/*)}*/}
        {/*{visible && form.type !== "EX" && (*/}
        {/*  <McVoicePlayer*/}
        {/*    name="语音播报"*/}
        {/*    onStop={onStop}*/}
        {/*    onPlay={onPlay}*/}
        {/*    setData={() => {*/}
        {/*      return {*/}
        {/*        data: form.check.body,*/}
        {/*        offset: form.check.offset,*/}
        {/*      };*/}
        {/*    }}*/}
        {/*  />*/}
        {/*)}*/}
        <McButton
          danger
          style={{ marginLeft: 24 }}
          key="apply"
          type="primary"
          onClick={() => {
            editor.handleApply();
            onCancel();
          }}
        >
          更新报底<McIcon size="large">rotate</McIcon>
        </McButton>
        <McButton warning key="close" type="primary" icon="close" onClick={onCancel}>
          关闭
        </McButton>
      </McAlign>
    </div>
  );
  return (
    <Modal
      width={"80%"}
      okText="开始"
      title={title}
      centered={true}
      visible={visible}
      footer={footer}
      onCancel={onCancel}
      className="mc-tx-check-modal"
      confirmLoading={loading}
      maskClosable={false}
    >
      {form.type === "EX" ? (
        <McExEditor
          head={form.check.head}
          body={form.check.body}
          flag={MceFlag.None}
          menu={MceMenu.None}
          onReady={editor.handleReady}
        />
      ) : (
        <McEditor
          head={form.check.head}
          body={form.check.body}
          menu={MceMenu.None}
          offset={form.check.page * 100 - 100}
          onReady={editor.handleReady}
          direction="tx"
          highlight={{ index: form.check.active, role: "body" }}
          image={image}
          type={form.type}
        />
      )}
    </Modal>
  );
};

export default McTxCheckModal;

import "./index.less";
import React, { FC, useState } from "react";
import useForm from "./useForm";
import useSave from "./useSave";
import useInit from "./useInit";
import useCheck from "./useCheck";
import useEditor from "./useEditor";
import { empty } from "misc/telegram";
import McBox from "components/mc-box";
import { useHistory } from "react-router";
import { Layout, Modal, Pagination } from "antd";
import McButton from "components/mc-button";
import McEditor from "components/mc-editor";
import McExEditor from "components/mc-ex-editor";
import McSaveModal from "components/mc-tx-save-modal";
import { MceFlag, MceMenu } from "mce/typing";
import usePaste from "./usePaste";
import message from "misc/message";
import McTaskModal from "components/mc-task-model";
import useAutoCK from "./useAutoCK";
// import qs from "query-string";
import { getAppType } from "misc/env";
import McPrintModal from "containers/mc-print-modal";
import usePreview from "components/mc-editor/preview/usePreview";
import Header from "containers/mc-header-terminal";

const McMorsePage: FC = () => {
  const history = useHistory();
  // const location = useLocation();
  // const search = useMemo(() => qs.parse(location.search), [location.search]);
  // const retpath = search.retpath !== null ? (search.retpath as string) : "";

  const [form, setForm, setProp] = useForm();
  const [save, loading] = useSave(setForm);
  // const [send] = useSend(setForm);
  const editor = useEditor(setForm);
  // const exit = useExit();
  // useEffect(() => {
  //   setProp("saved")(false);
  // }, [form.body, form.head, setProp]);

  useInit(setForm);
  const check = useCheck(form, setForm);
  usePaste(setForm);
  useAutoCK(form, setForm);
  // const { onPlay, onStop } = usePlayer(setForm);
  const [print, setPrint] = useState<boolean>(false);
  const content = usePreview(form.type, "训练报", form.head, form.body);

  const INITIAL_TASK: ITask = {
    completeFlag: 0,
    radioUuid: "",
    name: "",
    title: form.name,
    type: "1",
    workType: "1",
    datagramUuid: form.dir,
  };

  return (
    <Layout className="mc-tx-code-page">
      {getAppType() === "terminal" && (
        <Layout.Header>
          <Header>
            {form.name ? `编辑报文: ${form.name}` : "新建报文"}(
            {form.type === "CCK" ? "CW" : form.type})
          </Header>
        </Layout.Header>
      )}
      <Layout.Content style={{ margin: 0, padding: 0 }}>
        <div className="all-card">
          {getAppType() !== "terminal" && (
            <div className="telegram-title">
              {form.name ? `编辑报文: ${form.name}` : "新建报文"} (
              {form.type === "CCK" ? "CW" : form.type})
            </div>
          )}
          <div className="mc-body-area">
            {form.type === "EX" ? (
              <McExEditor
                head={form.head}
                body={form.body}
                flag={MceFlag.State}
                onReady={editor.handleReady}
              />
            ) : (
              <McEditor
                head={form.head}
                body={form.body}
                flag={MceFlag.State}
                offset={form.page * 100 - 100}
                // offset={form.offset}
                onReady={editor.handleReady}
                direction="tx"
                menu={MceMenu.Edit}
                highlight={{ index: form.active, role: form.role }}
                type={form.type}
              />
            )}
          </div>
          <div className="mc-foot-area">
            <McBox flex="1">
              <McBox display="flex" alignItems="center" marginLeft={32}>
                {/*<McTypePicker*/}
                {/*  value={form.type}*/}
                {/*  onChange={value => {*/}
                {/*    console.log("McTypePicker onChange----------", value);*/}
                {/*    setProp("type")(value);*/}
                {/*    setProp("saved")(false);*/}
                {/*  }}*/}
                {/*/>*/}
                {form.type !== "EX" && (
                  <>
                    <McButton
                      icon="delete"
                      danger
                      type="primary"
                      onClick={() => editor.handleDecrease(form)}
                      disabled={form.size <= 100}
                    >
                      删除本页
                    </McButton>
                    <McButton
                      icon="plus"
                      type="primary"
                      onClick={() => editor.handleInsertPage(form)}
                    >
                      前插页
                    </McButton>
                    <McButton
                      icon="file-add"
                      type="primary"
                      onClick={
                        () => editor.handleIncrease(form)
                        // editor.handleIncrease(form)
                      }
                    >
                      后插页
                    </McButton>

                    <Pagination
                      showLessItems
                      showQuickJumper={false}
                      showSizeChanger={false}
                      pageSize={100}
                      total={form.size}
                      current={form.page}
                      onChange={page => {
                        // alert(page);
                        setProp("page")(page);
                      }}
                    />
                    <div className="mc-info-card" style={{ marginTop: 0 }}>
                      <div className="mc-info-card__tips">
                        Shift - : 删除一格 | Shift + : 增加一格
                        <br />
                        Shift【 : 删除一行 | Shift 】: 增加一行
                      </div>
                    </div>
                  </>
                )}
              </McBox>
            </McBox>
            {form.warn && (
              <div className="mc-info-card">
                <div className="mc-info-card__warn">
                  <span style={{ fontSize: 18 }}>警告：</span>
                  录入报文部分格式不正确，请仔细核正
                </div>
              </div>
            )}
            {/*{form.type !== "EX" && (*/}
            {/*  <McVoicePlayer*/}
            {/*    name="语音播报"*/}
            {/*    onStop={onStop}*/}
            {/*    onPlay={onPlay}*/}
            {/*    setData={() => {*/}
            {/*      return {*/}
            {/*        data: form.body,*/}
            {/*        offset: form.offset,*/}
            {/*      };*/}
            {/*    }}*/}
            {/*  />*/}
            {/*)}*/}
            <div className="mc-divider" />
            {/*<McButton*/}
            {/*  type="primary"*/}
            {/*  onClick={() => setProp("modalTask")(true)}*/}
            {/*  disabled={empty(form.head) || empty(form.body) || !form.saved}*/}
            {/*>*/}
            {/*  指派任务*/}
            {/*  <McIcon>assign</McIcon>*/}
            {/*</McButton>*/}
            {/* <div className="mc-divider" /> */}
            <McButton
              icon="save"
              type="primary"
              onClick={() => {
                setPrint(true);
              }}
            >
              打印
            </McButton>
            <McButton
              icon="save"
              type="primary"
              onClick={() => {
                if (!check()) return;
                message.destroy();
                setProp("modal")(true);
              }}
              disabled={empty(form.head) || empty(form.body) || form.saved}
            >
              保存
            </McButton>
            <McButton
              icon="exit"
              type="primary"
              danger={true}
              onClick={() => {
                if (form.saved) {
                  history.goBack();
                } else {
                  Modal.confirm({
                    title: "退出编辑",
                    content: "您有修改未保存，确定要退出？",
                    centered: true,
                    onOk: () => history.goBack(),
                  });
                }
              }}
            >
              返回
            </McButton>
          </div>

          <McSaveModal
            name={form.name}
            date={form.date}
            title="保存"
            loading={loading}
            visible={form.modal}
            exit={false}
            goTx={getAppType() !== "control"}
            onSubmit={async goTx => {
              await save(form, goTx);
              // history.push("/home");
            }}
            onCancel={() => setProp("modal")(false)}
            onChange={x => setForm({ ...form, ...x })}
            onExit={() => history.push("/telegram")}
          >
            * 报文将保存为电子报底，请填写报文名称。
          </McSaveModal>
          {form.modalTask && (
            <McTaskModal
              mode="add"
              onCancel={() => setProp("modalTask")(false)}
              currTask={{ ...INITIAL_TASK, bizType: form.type }}
              onOk={() => setProp("modalTask")(false)}
            />
          )}
          {print && (
            <McPrintModal
              visible={print}
              templates={true}
              // type={form.type}
              type={"CCK"}
              // onChangeTmpl={
              //   // name => setTplName(name)
              //   name => setTplName("训练报")
              // }
              callback={() => {
                setPrint(false);
                // setForm(x => ({
                //   ...x,
                //   ui: {
                //     ...x.ui,
                //     print: false,
                //   },
                // }));
              }}
            >
              {content}
            </McPrintModal>
          )}

          {/* <McSaveTdModal
              name={form.name}
              date={form.date}
              title="是否发送"
              loading={loading}
              visible={form.modalTd}
              onSubmit={() => {
                if (form.datagramType === "CW") {
                  // alert(form.dir);
                  history.push(`/cw?dir=${encodeURIComponent(form.dir)}`);
                } else if (form.datagramType === "DATA") {
                  history.push(`/datagram?from=${encodeURIComponent(form.dir)}&type=${form.type}`);
                } else if (form.datagramType === "TEL") {
                  history.push(`/voicdgram?dir=${encodeURIComponent(form.dir)}`);
                }
              }}
              onCancel={() => setProp("modal")(false)}
              onChange={x => setForm({ ...form, ...x })}
              onExit={() => exit(form)}
            >
              * 文件已保存，请选择发送方式，或不发送。
            </McSaveTdModal> */}
          {/*<Prompt*/}
          {/*  message={() => {*/}
          {/*    if (form.saved) {*/}
          {/*      return true;*/}
          {/*    }*/}
          {/*    return "您有未保存的内容，确定要离开？";*/}
          {/*  }}*/}
          {/*/>*/}
        </div>
      </Layout.Content>
    </Layout>
  );
};

// export default withTabbar(McMorsePage)("tx");
export default McMorsePage;

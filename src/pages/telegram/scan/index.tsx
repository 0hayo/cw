import "./index.less";
import qs from "query-string";
import Choice from "./choice";
import useForm from "./useForm";
import useSave from "./useSave";
import useScanImage from "./useScanImage";
import useInit from "./useInit";
import useExit from "./useExit";
import useCheck from "./useCheck";
import useClean from "./useClean";
import useEditor from "./useEditor";
import { empty, size } from "misc/telegram";
import withTabbar from "hoc/withTabbar";
import { Layout, Pagination } from "antd";
import React, { FC, useMemo, useRef } from "react";
import McBody from "components/mc-body";
import McEditor from "components/mc-editor";
import McCamera from "components/mc-camera";
import McButton from "components/mc-button";
import McDocxViewer from "components/mc-docx-viewer";
// import McVoicePlayer from "components/mc-voice-player";
import McSaveModal from "components/mc-tx-save-modal";
import { useHistory, useLocation } from "react-router";
import { MceMenu } from "mce/typing";
// import usePlayer from "./usePlayer";
import useAutoCK from "./useAutoCK";
import message from "misc/message";
import { getAppType } from "misc/env";
import McJsonViewer from "components/mc-json-viewer";
import McExEditor from "components/mc-ex-editor";
import Header from "containers/mc-header-terminal";

const McPhotoPage: FC = () => {
  const history = useHistory();
  const location = useLocation();
  const parsed = useMemo(() => qs.parse(location.search), [location.search]);
  const type = useRef<TelegramBizType | undefined>("CW");

  const [form, setForm, setProp] = useForm(type.current);
  const [save, loading] = useSave(setForm);
  const editor = useEditor(setForm);
  const [add, drop, ocr, ocrLoading] = useScanImage(setForm);
  const clean = useClean(setForm);
  const exit = useExit();
  const check = useCheck(form, setForm);

  // const { onPlay, onStop } = usePlayer(setForm);
  useAutoCK(form, setForm);

  // useEffect(() => {
  //   setProp("saved")(false);
  // }, [form.body, form.head, setProp]);

  useInit(type.current, setForm);
  useCheck(form, setForm);

  return (
    <Layout className="mc-tx-scan-page">
      {getAppType() === "terminal" && (
        <Layout.Header>
          <Header>智能识报-{form.type}</Header>
        </Layout.Header>
      )}
      <Layout.Content>
        <McBody>
          {/* {getAppType() === "single" && (
            <div className="telegram-title">
              智能识别
            </div>
          )} */}
          <div className="mc-body-area">
            {(() => {
              if (parsed.mode === "photo" || parsed.mode === "video") {
                return (
                  <McCamera
                    mode={parsed.mode}
                    images={form.images}
                    loading={ocrLoading}
                    onScan={image => ocr(image, form)}
                    onTake={image => add(image, form)}
                    onDrop={image => drop(image, form)}
                  />
                );
              }
              if (parsed.mode === "docx") {
                return (
                  <McDocxViewer
                    docs={form.images}
                    loading={ocrLoading}
                    onScan={image => ocr(image, form)}
                  />
                );
              }
              if (parsed.mode === "json") {
                return (
                  <McJsonViewer
                    fileName={form.images[0]?.name}
                    filePath={form.images[0]?.url}
                    loading={ocrLoading}
                    onScan={(telegram, name, type) => {
                      const telegramSize = type === "EX" ? 1 : size(telegram.body);
                      const body = type === "EX" ? { "0": telegram.body["0"] } : telegram.body;
                      setForm(x => ({
                        ...x,
                        head: telegram.head,
                        body: body,
                        name: name,
                        size: telegramSize,
                        type: type,
                      }));
                    }}
                  />
                );
              }
              return <Choice />;
            })()}
            <div className="mc-editor-wrapper">
              {(form.type === "CW" || form.type === "CCK") && (
                <McEditor
                  head={form.head}
                  body={form.body}
                  offset={form.page * 100 - 100}
                  onReady={editor.handleReady}
                  direction="tx"
                  menu={MceMenu.Edit}
                  highlight={{ index: form.active, role: form.role }}
                  type={form.type}
                />
              )}
              {form.type === "EX" && (
                <McExEditor
                  head={form.head}
                  body={form.body}
                  onReady={editor.handleReady}
                  menu={MceMenu.Edit}
                />
              )}
              <div className="mc-paging-area">
                <Pagination
                  showLessItems
                  total={form.size}
                  current={form.page}
                  pageSize={100}
                  onChange={page => setProp("page")(page)}
                  showSizeChanger={false}
                />
              </div>
              <div className="mc-foot-area-wrapper">
                <div className="mc-foot-area">
                  {/* <div>
                    电报类型: &nbsp;
                    <McTypePicker
                      value={form.type}
                      excludes={["EX"]}
                      onChange={value => setProp("type")(value)}
                    />
                  </div> */}
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
                    onClick={() => editor.handleIncrease(form)}
                  >
                    后插页
                  </McButton>
                  {/* <div className="mc-divider" /> */}
                  <McButton
                    warning
                    icon="delete"
                    type="primary"
                    onClick={() => editor.handleDecrease(form)}
                  >
                    删除本页
                  </McButton>
                  <McButton warning icon="delete" type="dashed" onClick={() => clean(-1)}>
                    删除所有
                  </McButton>
                </div>
                <div className="mc-foot-area mc-bottom-btns">
                  <div className="mc-info-card">
                    {form.warn && (
                      <div className="mc-info-card__warn">
                        <span style={{ fontSize: 18 }}>警告：</span>
                        识别报文部分格式不正确，请仔细核正
                      </div>
                    )}
                    <div className="mc-info-card__tips">
                      Shift - : 删除一格 | Shift + : 增加一格
                      <br />
                      Shift【 : 删除一行 | Shift 】: 增加一行
                    </div>
                  </div>
                  {/* <McVoicePlayer
                    name="语音播报"
                    onStop={onStop}
                    onPlay={onPlay}
                    setData={() => {
                      return {
                        data: form.body,
                        offset: form.offset,
                      };
                    }}
                  /> */}
                  <div className="mc-divider" />
                  {/* <McButton
                    type="primary"
                    onClick={() => {
                      setForm(it => {
                        it.name = it.name || `${form.type}-${new Date().toISOString()}`;
                        checkSend(it, form.images);
                        return it;
                      });
                    }}
                    disabled={empty(form.head) || empty(form.body)}
                  >
                    进入发报
                    <SendOutlined rotate={-90} />
                  </McButton> */}
                  <McButton
                    icon="save"
                    type="primary"
                    onClick={() => {
                      if (!check()) return;
                      message.destroy();
                      setProp("modal")(true);
                    }}
                    disabled={empty(form.head) || empty(form.body)}
                  >
                    保存
                  </McButton>
                  <McButton icon="exit" danger={true} onClick={() => exit(form)}>
                    返回
                  </McButton>
                </div>
              </div>
            </div>
          </div>
          <McSaveModal
            title="保存"
            name={form.name}
            date={form.date}
            loading={loading}
            visible={form.modal}
            exit={false}
            goTx={getAppType() !== "control"}
            onSubmit={goTx => {
              save(form, goTx);
              if (window.history.length > 1) {
                window.history.back();
              } else {
                if (getAppType() === "control") {
                  history.push("/telegram");
                } else {
                  history.push("/");
                }
              }
            }}
            onCancel={() => setProp("modal")(false)}
            onChange={x => setForm({ ...form, ...x })}
            onExit={() => history.push("/telegram")}
          >
            * 报文将保存在电子报底，请填写报文名称。
          </McSaveModal>
          {/* <Prompt
            message={() => {
              if (form.saved) {
                return true;
              }
              return "您有未保存的内容，确定要离开？";
            }}
          /> */}
        </McBody>
      </Layout.Content>
    </Layout>
  );
};

export default withTabbar(McPhotoPage)("tx");

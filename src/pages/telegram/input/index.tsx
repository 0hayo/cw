import "./index.less";
import React, { FC } from "react";
import McButton from "components/mc-button";
import withTabbar from "hoc/withTabbar";
import McTelegramEditor from "components/mc-editor/input";
import MstPanel from "components/mst-panel";
import useForm from "./useForm";
import useEditor from "./useEditor";
import useInit from "./useInit";
import McBlock from "components/mc-block";
import useAutoCK from "./useAutoCK";
import useAutoHeight from "hooks/useAutoHeight";
import useSave from "./useSave";
import useCheck from "./useCheck";
import message from "misc/message";
import McSaveModal from "components/mc-tx-save-modal";
import { getAppType } from "misc/env";
import { useHistory } from "react-router";
import { SaveOutlined, PrinterOutlined } from "@ant-design/icons";
import McTelegramExEditor from "components/mc-ex-editor/input";
import useGuid from "hooks/useGuid";
import usePrint from "containers/mc-print-modal/userPrint";
import { MstTheme } from "less/theme";
import usePreview from "components/mc-editor/preview/usePreview";

const McTelegramInput: FC = () => {
  const history = useHistory();
  const guid = useGuid();
  const print = usePrint(guid);
  // const [print, setPrint] = useState<boolean>(false);
  const [form, setForm, setProp] = useForm();
  const editor = useEditor(setForm);
  useInit(setForm);
  const check = useCheck(form, setForm);
  const [save, loading] = useSave(setForm);
  // const [printLoading, setPrintLoading] = useState(false);
  useAutoCK(form, setForm);
  const content = usePreview(form.type, form.name, form.head, form.body, 1.0);
  const previewHeight = useAutoHeight("main-container", 32);

  return (
    <MstPanel title="录入报文" className="mc-telegram-input">
      <div className="mc-editor-area" id="main-container">
        <McBlock className="preview-area">
          <div
            className="preview-box"
            id={`mc-print-content-${guid}`}
            style={{ height: previewHeight }}
          >
            {content}
          </div>
        </McBlock>
        {form.type === "EX" ? (
          <McTelegramExEditor
            head={form.head}
            body={form.body}
            direction="tx"
            onReady={editor.handleReady}
            onBodyChange={body => {
              setProp("body")(body);
            }}
          />
        ) : (
          <McTelegramEditor
            head={form.head}
            body={form.body}
            direction="tx"
            type={form.type}
            onReady={editor.handleReady}
            onBodyChange={body => {
              setProp("body")(body);
            }}
          />
        )}
      </div>
      <div className="mc-menu-area">
        <McButton type="primary" onClick={() => print()}>
          <PrinterOutlined /> 打印
        </McButton>
        <McButton
          type="primary"
          onClick={() => {
            if (!check()) return;
            message.destroy();
            setProp("modal")(true);
          }}
          style={{ backgroundColor: MstTheme.mc_grey_color }}
        >
          <SaveOutlined />
          保存
        </McButton>
        <McButton
          type="primary"
          danger={true}
          onClick={() => {
            history.goBack();
          }}
        >
          退出
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
          // const obj = {
          //   ...form,
          //   type: type ? "TB" : form.type,
          //   head: {
          //     ...form.head,
          //     RMKS: {
          //       value: type ? "CQ" : form.head["RMKS"].value,
          //       warn: false
          //     }
          //   }
          // }
          await save(form, goTx);
          // history.push("/home");
        }}
        onCancel={() => setProp("modal")(false)}
        onChange={x => setForm({ ...form, ...x })}
        onExit={() => history.push("/telegram")}
      >
        将保存为待发报文，请输入报文名称：
      </McSaveModal>
    </MstPanel>
  );
};

export default withTabbar(McTelegramInput)("telegram");

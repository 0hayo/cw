import "./indexcwShow.less";
import useChat from "./useChat";
import useForm from "./useForm";
import useExit from "./useExit";
import McBox from "components/mc-box";
import McEditor from "components/mc-editor";
import McButton from "components/mc-button";
import React, { FC, useEffect, useMemo, useState } from "react";
import { MceFlag, MceMenu } from "mce/typing";
import McExEditor from "components/mc-ex-editor";
import McChatPanel from "containers/mc-chat-panel";
import { Pagination } from "antd";
import McTxCheckModal from "./check";
import useInitcwShow from "./useInitcwShow";
import cwIForm from "pages/cw/form";
import { useLocation } from "react-router";
import qs from "query-string";
import McPrintModal from "containers/mc-print-modal";
import MstPanel from "components/mst-panel";
import usePreview from "components/mc-editor/preview/usePreview";

interface IProps {
  uuid?: string;
  types?: TelegramBizType;
  cwForm?: cwIForm;
  setCwForm?: (x) => void;
  listFlag?: boolean;
}

const McReadyCwPage: FC<IProps> = ({ uuid, types, cwForm, setCwForm, listFlag }) => {
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  // const dir = search.dir as string;

  const showFlag = search.filetype ? true : false;

  const showButton = search.show ? true : showFlag ? true : false;

  const [chat, setChat] = useState(true);
  const [form, setForm, setProp] = useForm();
  const [tplName, setTplName] = useState<string>("训练报");
  const content = usePreview(form.type, tplName, form.head, form.body);

  // const [printFlag, setPrintFlag] = useState(true);

  const [check, setCheck] = useState(false);

  useInitcwShow(setForm, uuid);
  useChat(setForm);

  // const codeShowFlag = dir === undefined ? false : listFlag ? false : !showButton ? true : false;
  // const [codeShow, setCodeShow] = useState(codeShowFlag);
  // const [initPlay] = useState(false);
  // const [exitFlag, setExitFlag] = useState<boolean>(false);
  // alert(3);
  const exit = useExit(form, () => {}, showButton);

  // search.print ? setForm( x=> ({
  //   ...x,
  //   ui:{
  //     ...x.ui,
  //     print: true,
  //   }
  // })) : setForm( x=> ({
  //   ...x,
  //   ui:{
  //     ...x.ui,
  //     print: false,
  //   }
  // }))

  useEffect(() => {
    const t = setTimeout(() => {
      search.print
        ? setForm(x => ({
            ...x,
            ui: {
              ...x.ui,
              print: true,
            },
          }))
        : setForm(x => ({
            ...x,
            ui: {
              ...x.ui,
              print: false,
            },
          }));
    }, 1000);
    return () => {
      clearTimeout(t);
    };
  }, [search.print, setForm]);

  return (
    <div className="mc-tx-show">
      <div className="tx-main-panel">
        <MstPanel
          className="tx-editor-panel"
          title={
            <>
              <div className="tx-telegram-name">{`发报记录 - ${form.name}`}</div>
            </>
          }
        >
          {form.type === "EX" ? (
            <McExEditor
              readonly
              head={form.head}
              body={form.body}
              flag={MceFlag.State}
              menu={form.transmit ? MceMenu.None : MceMenu.None | MceMenu.Suffix}
              onReady={mci => {
                // editor.handleReady(mci);
              }}
            />
          ) : (
            <McEditor
              readonly
              head={form.head}
              body={form.body}
              flag={MceFlag.State}
              menu={form.transmit ? MceMenu.None : MceMenu.None | MceMenu.Suffix}
              offset={form.page * 100 - 100}
              onReady={mci => {
                // editor.handleReady(mci);
              }}
              direction="tx"
              type={form.type}
            />
          )}
          <McBox className="tx-editor-pagination">
            {form.type !== "EX" && (
              <Pagination
                showLessItems
                showSizeChanger={false}
                pageSize={100}
                total={form.size}
                current={form.page}
                onChange={page => {
                  setForm(x => ({
                    ...x,
                    page: page,
                  }));
                }}
              />
            )}
          </McBox>
          <div className="mc-tx-bottom-bar">
            <div className="mc-divider" />
            <McButton
              type="primary"
              icon="exit"
              danger={true}
              // disabled={form.transmit || form.ui.prepare}
              onClick={() => {
                // logInfo("退出发报作业");
                // setExitFlag(true);
                exit(form);
              }}
            >
              退出
            </McButton>
          </div>
        </MstPanel>
        {chat && (
          <div className="tx-right-panel">
            <McChatPanel
              type="tx"
              feed={form.feed}
              feedRx={form.feedRx}
              text={form.code}
              hint={form.hint}
              chat={false}
              onLaunch={text => {}}
              onGoSend={it => {
                let textarea = document.getElementById("mc-chat-textarea") as HTMLTextAreaElement;
                textarea.value = it.value.toUpperCase();
                if (it.sendStatus && it.type === "tx") {
                  setForm({
                    ...form,
                    sendStatus: false,
                    sendNumber: form.sendNumber - 1,
                  });
                }
              }}
              play={true}
              messages={form.messages}
              disabled={form.transmit}
              onClose={() => setChat(false)}
              onChange={(uuid, text) => {
                const next = form.messages.map(x => {
                  if (x.uuid === uuid) {
                    return {
                      ...x,
                      value: text.toUpperCase(),
                    };
                  }
                  return x;
                });
                setProp("messages")(next);
              }}
              frequencyFlag={false}
            />
          </div>
        )}
        <McTxCheckModal
          visible={check}
          form={form}
          setForm={setForm}
          onCancel={() => setCheck(false)}
          title={form.type === "EX" ? "编辑报底" : "检查报底"}
        />
        {form.ui.print && (
          <McPrintModal
            visible={form.ui.print}
            templates={true}
            // type={form.type}
            type={"CCK"}
            onChangeTmpl={
              // name => setTplName(name)
              name => setTplName("训练报")
            }
            callback={() => {
              // setPrintFlag(false);
              // alert(printFlag);
              // setForm(x => ({
              //   ...x,
              //   ui: {
              //     ...x.ui,
              //     print: false,
              //   },
              // }));
              exit(form);
            }}
          >
            {content}
          </McPrintModal>
        )}
      </div>
    </div>
  );
};

export default McReadyCwPage;

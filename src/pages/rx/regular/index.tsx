import "./index.less";
import useSave from "../useSave";
import { IProps } from "../typing";
import useRegularPreview from "components/mc-editor/preview/useRegularPreview";
import McBox from "components/mc-box";
import { Pagination, Modal } from "antd";
import McButton from "components/mc-button";
import McEditor from "components/mc-editor";
import McExEditor from "components/mc-ex-editor";
import McChatPanel from "containers/mc-chat-panel";
import McSaveModal from "components/mc-rx-save-modal";
import McPrintModal from "containers/mc-print-modal";
import React, { FC, ReactElement, useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router";
import useForward from "../useForward";
import qs from "query-string";
import { getAppType } from "misc/env";
import McTaskExecModal from "components/mc-exec-task-modal";
import useEditor from "./useEditor";
import withTabbar from "hoc/withTabbar";
import { logInfo, logRxTxTime } from "misc/util";
import moment from "moment";
import MstPanel from "components/mst-panel";
import McLoading from "components/mc-loading";
import message from "misc/message";

const McRxRegular: FC<IProps> = ({ form, setForm, cwForm, setCwForm }) => {
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  // const receive = search.receive ? (search.receive as string) : "true";
  const retpath = search.retpath ? (search.retpath as string) : "";

  const save = useSave(setForm);
  const forward = useForward(setForm);
  const history = useHistory();
  const [tplName, setTplName] = useState<string>("训练报");
  const editor = useEditor(setForm);
  const [showExecModal, setShowExecModal] = useState(false);
  const { getPreviewContent } = useRegularPreview();
  // const content = useRegularPreview(form.type, tplName, form.regular.head, form.regular.body);
  const [content, setContent] = useState<ReactElement>();

  const fromFile = search.fromFile; //是否从文件管理的“已收报文”跳转来

  // useEffect(() => {
  //   console.log("rx/regular/index.tsx: content Effect triggered !!!!!!!!!!!!!");
  //   (async () => {
  //     const _content = await getPreviewContent(form.type, tplName, form.regular.head, form.regular.body);
  //     setContent(_content);
  //   })();
  // }, [form.type, tplName, form.regular.head, form.regular.body]);

  useEffect(() => {
    if (!fromFile) {
      setCwForm && setCwForm(x => ({ ...x, cwTitle: "整报校报" }));
    }
  }, [fromFile, setCwForm]);

  return (
    <div className="mc-rx-regular">
      <div className="main-panel">
        <MstPanel
          className="regular-editor-panel"
          title={
            <>
              <div className="tx-telegram-name">{`整报校报 - ${form.name}`}</div>
            </>
          }
        >
          {form.type === "EX" ? (
            <McExEditor
              flag={form.flag}
              head={form.regular.head}
              body={form.regular.body}
              onReady={editor.handleReady}
            />
          ) : (
            <McEditor
              // menu={MceMenu.RegularPre | MceMenu.RegularSuf}
              head={form.regular.head}
              body={form.regular.body}
              flag={form.flag}
              offset={form.regular.page * 100 - 100}
              onReady={editor.handleReady}
              highlight={{ index: form.regular.offset, role: form.role }}
              direction="rx"
              type={form.type}
            />
          )}
          <div className="mc-foot-area">
            <McBox className="editor-pagination">
              {form.type !== "EX" && (
                <div className="mc-navi-area">
                  <Pagination
                    showLessItems
                    showSizeChanger={false}
                    pageSize={100}
                    current={form.regular.page}
                    total={form.regular.size}
                    onChange={page => {
                      setForm(x => ({
                        ...x,
                        regular: {
                          ...form.regular,
                          page,
                        },
                      }));
                    }}
                  />
                </div>
              )}
            </McBox>
            <div className="mc-regular-bottom-bar">
              <McButton
                icon="printer"
                type="primary"
                onClick={async () => {
                  const _content = await getPreviewContent(
                    form.type,
                    tplName,
                    form.regular.head,
                    form.regular.body
                  );
                  setContent(_content);
                  setForm(x => {
                    return {
                      ...x,
                      ui: {
                        ...x.ui,
                        save: false,
                        print: true,
                      },
                    };
                  });
                }}
              >
                打印
              </McButton>
              <McButton
                warning
                icon="check"
                type="primary"
                onClick={() => {
                  setForm(x => {
                    return {
                      ...x,
                      ui: {
                        ...x.ui,
                        save: true,
                        print: false,
                      },
                    };
                  });
                }}
              >
                保存
              </McButton>
              <McButton
                type="primary"
                danger
                style={{ marginRight: 16 }}
                onClick={() => {
                  if (retpath === "home") {
                    history.push("/home?type=show");
                  } else {
                    history.push("/files/recv");
                  }
                }}
              >
                返回
              </McButton>
            </div>
          </div>
        </MstPanel>
        {form.ui.chat && (
          <McChatPanel
            type="rx"
            feed={form.feed}
            feedRx={form.feedRx}
            text={form.code}
            hint={form.hint}
            file={form.session ? form.session.file : ""}
            play={true}
            chat={false}
            // onLaunch={sender.chat}
            onLaunch={() => {}}
            messages={form.messages}
            disabled={form.transmit}
            onClose={() => {
              setForm(x => ({
                ...x,
                ui: {
                  ...x.ui,
                  chat: false,
                },
              }));
            }}
            onChange={(uuid, text) => {
              const messages = form.messages.map(x => {
                if (x.uuid === uuid) {
                  return {
                    ...x,
                    value: text,
                  };
                }
                return x;
              });
              setForm(x => ({
                ...x,
                messages,
              }));
            }}
            frequencyFlag={false}
          />
        )}
      </div>
      <McSaveModal
        print
        title="保存收报记录"
        name={form.name}
        // date={form.date}
        date={new Date().toISOString()}
        state={form.state}
        visible={form.ui.save}
        onChange={x => setForm({ ...form, ...x })}
        // onSubmit={() => {
        //   // alert(4);
        //   save(form, () => {}, cwForm);
        //   message.success("保存成功！");
        //   if (retpath === "") {
        //     history.push("/home");
        //   } else {
        //     history.push("/files/recv");
        //   }
        // }}
        onSubmit={() => {
          if (form.name === "") {
            Modal.error({
              title: "信息提醒",
              content: "请输入报文名称",
            });
            return;
          }
          logInfo("保存收报:" + form.name);
          logRxTxTime("rx", form.startTime, moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"));
          setForm(x => ({ ...x, ui: { ...x.ui, loading: true } }));
          save(
            form,
            () => {
              message.success("保存成功！");
              setForm(x => ({
                ...x,
                ui: {
                  ...x.ui,
                  save: false,
                  loading: false,
                },
              }));
              if (retpath === "home") {
                history.push("/home");
              } else {
                history.push("/files/recv");
              }
            },
            cwForm
          );
        }}
        onForward={() => {
          if (form.name === "") {
            Modal.error({
              title: "信息提醒",
              content: "请输入报文名称",
            });
            return;
          }
          logInfo("保存收报:" + form.name);
          logRxTxTime("rx", form.startTime, moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"));
          setForm(x => ({ ...x, ui: { ...x.ui, loading: true } }));
          if (getAppType() === "control") {
            setForm({ ...form, ui: { ...form.ui, save: false, loading: true } });
            save(form, () => {
              message.success("保存成功！");
              setShowExecModal(true);
            });
          } else {
            save(form, () => {
              message.success("保存成功！");
              setTimeout(() => {
                // alert("bb=" + form.dir);
                forward(form);
              }, 200);
              // forward(form);
            });
          }
        }}
        onCancel={() => {
          // alert(2);
          setForm(x => ({
            ...x,
            ui: {
              ...x.ui,
              save: false,
            },
          }));
        }}
        onPrint={async () => {
          const _content = await getPreviewContent(
            form.type,
            tplName,
            form.regular.head,
            form.regular.body
          );
          setContent(_content);
          setForm(x => ({ ...x, ui: { ...x.ui, loading: true } }));
          save(form, () => {
            setForm(x => {
              if (!x["head"] || !x["body"]) return;
              let grade1 = "加急";
              if (x["head"]["CLS"].value === "01") {
                grade1 = "急报";
              } else if (x["head"]["CLS"].value === "02") {
                grade1 = "加急";
              } else if (x["head"]["CLS"].value === "03") {
                grade1 = "特急";
              }
              const grade2 = grade1;
              x["head"]["CLS"] = {
                ...x["head"]["CLS"],
                value: grade2,
                crude: x["head"]["CLS"].value,
                light: true,
                // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
              };
              return {
                ...x,
                ui: {
                  ...x.ui,
                  save: false,
                  print: true,
                  loading: false,
                },
              };
            });
          });
        }}
        onExit={() => {
          if (retpath === "home") {
            history.push("/home");
          } else {
            history.push("/home");
          }
        }}
      >
        * 报文接收完成，此次收报记录将保存在收报文件夹。
      </McSaveModal>
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
            setForm(x => ({
              ...x,
              ui: {
                ...x.ui,
                print: false,
              },
            }));
          }}
        >
          {content}
        </McPrintModal>
      )}
      {/** 执行任务: 转发 */}
      {showExecModal && (
        <McTaskExecModal
          telegram={{ uuid: form.dir, title: form.name, type: form.type }}
          currTask={{
            datagramUuid: form.dir,
            completeFlag: 0,
            name: form.name,
            title: form.cwTitle,
            type: "1",
          }}
          type="1" //发报
          // telegram={}
          // contactTableId={currContactId}
          onCancel={() => setShowExecModal(false)}
          onOk={() => forward(form)}
        />
      )}
      {form.ui.loading && <McLoading>处理中</McLoading>}
    </div>
  );
};

export default withTabbar(McRxRegular)("regular");

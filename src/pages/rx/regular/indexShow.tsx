import "./index.less";
import useSave from "../useSave";
import usePreview from "components/mc-editor/preview/usePreview";
import McBox from "components/mc-box";
import { Pagination, Modal } from "antd";
import McButton from "components/mc-button";
import McEditor from "components/mc-editor";
import McExEditor from "components/mc-ex-editor";
import McChatPanel from "containers/mc-chat-panel";
import McSaveModal from "components/mc-rx-save-modal";
import McPrintModal from "containers/mc-print-modal";
import React, { FC, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router";
import useForward from "../useForward";
import qs from "query-string";
import { getAppType } from "misc/env";
import McTaskExecModal from "components/mc-exec-task-modal";
import useForm from "../useForm";
import useChat from "../useChat";
import useInit from "../useInit";
import withTabbar from "hoc/withTabbar";
import { setTaskLabelCompleted } from "misc/env";
import MstPanel from "components/mst-panel";

// const McRxRegular: FC<IProps> = ({ form, setForm, cwForm }) => {
const McRxShow: FC = () => {
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const receive = search.receive ? (search.receive as string) : "true";
  const retpath = search.retpath ? (search.retpath as string) : "";
  // const receive ="true";
  // debugger;
  const [form, setForm] = useForm();

  useChat(setForm);
  useInit(setForm);

  const save = useSave(setForm);
  const forward = useForward(setForm);
  const history = useHistory();
  const [tplName, setTplName] = useState<string>("训练报");
  // const socket = useSocket();
  // const sender = useSender(socket, setForm);
  const content = usePreview(form.type, tplName, form.regular.head, form.regular.body);
  // const editor = useEditor(setForm);
  // const { onPlay, onStop } = usePlayer(setForm);
  // const regular = useRegular(setForm);
  const [showExecModal, setShowExecModal] = useState(false);

  return (
    <div className="mc-rx-regular mc-rx-regular-show">
      <div className="main-panel">
        <MstPanel
          className="regular-editor-panel"
          title={
            <>
              <div className="tx-telegram-name">{`查看收报记录 - ${form.name}`}</div>
            </>
          }
        >
          {form.type === "EX" ? (
            <McExEditor
              flag={form.flag}
              head={form.regular.head}
              body={form.regular.body}
              readonly
              // onReady={editor.handleReady}
            />
          ) : (
            <McEditor
              // menu={MceMenu.None | MceMenu.RegularSuf}
              head={form.regular.head}
              body={form.regular.body}
              flag={form.flag}
              readonly
              offset={form.regular.page * 100 - 100}
              // onReady={editor.handleReady}
              highlight={{ index: form.regular.offset, role: form.role }}
              direction="rx"
              type={form.type}
            />
          )}
          <div className="mc-foot-area">
            <McBox className="editor-pagination">
              {form.type !== "EX" && (
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
              )}
            </McBox>
            <div className="mc-regular-bottom-bar">
              {receive === "true" && (
                <McButton
                  icon="recv"
                  type="primary"
                  style={{ marginRight: 16 }}
                  onClick={() => {
                    setForm(x => ({
                      ...x,
                      scene: "ready",
                      receive: true,
                    }));
                  }}
                >
                  返回收报
                </McButton>
              )}
              {receive === "false" && (
                <McButton
                  type="primary"
                  style={{ marginRight: 16 }}
                  onClick={() => forward(form)}
                  // onClick={() => {
                  //   setShowExecModal(true);
                  // }}
                >
                  转发
                </McButton>
              )}
              <McButton
                icon="printer"
                type="primary"
                onClick={() => {
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
              {receive === "false" && (
                <McButton
                  type="primary"
                  danger
                  style={{ marginRight: 16 }}
                  onClick={() => {
                    if (retpath === "home") {
                      setTaskLabelCompleted("1");
                      history.push("/home?type=show");
                    } else {
                      history.push("/files/recv");
                    }
                  }}
                >
                  返回
                </McButton>
              )}
              {receive === "true" && (
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
              )}
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
        <McSaveModal
          print
          title="保存收报数据"
          name={form.name}
          date={form.date}
          state={form.state}
          visible={form.ui.save}
          onChange={x => setForm({ ...form, ...x })}
          onSubmit={() => {
            if (form.name === "") {
              Modal.error({
                title: "信息提醒",
                content: "请输入报文名称",
              });
              return;
            }
            save(
              form,
              () => {
                // message.success("保存成功！");
                setForm(x => ({
                  ...x,
                  ui: {
                    ...x.ui,
                    save: false,
                  },
                }));

                if (retpath === "") {
                  history.push("/home");
                } else {
                  history.push("/files/recv");
                }
              }
              // cwForm
            );
          }}
          onForward={() => {
            if (getAppType() === "control") {
              setForm({ ...form, ui: { ...form.ui, save: false } });
              save(form, () => {
                setShowExecModal(true);
              });
            } else {
              save(form, () => {
                forward(form);
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
          onPrint={() => {
            save(form, () => {
              setForm(x => {
                // let grade1 = "加急";
                // if (x["head"]["CLS"].value === "01") {
                //   grade1 = "急报";
                // } else if (x["head"]["CLS"].value === "02") {
                //   grade1 = "加急";
                // } else if (x["head"]["CLS"].value === "03") {
                //   grade1 = "特急";
                // }
                // const grade2 = grade1;
                // x["head"]["CLS"] = {
                //   ...x["head"]["CLS"],
                //   value: grade2,
                //   crude: x["head"]["CLS"].value,
                //   light: true,
                //   // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
                // };
                return {
                  ...x,
                  ui: {
                    ...x.ui,
                    save: false,
                    print: true,
                  },
                };
              });
            });
          }}
          onExit={() => {
            if (retpath === "") {
              history.push("/home");
            } else {
              history.push("/files/recv");
            }
          }}
          showFlag={false}
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
            contactTableId={form.contactTableId}
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
      </div>
    </div>
  );
};

export default withTabbar(McRxShow)("files");

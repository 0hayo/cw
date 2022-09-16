import "./index.less";
import { Layout } from "antd";
import React, { FC, useContext, useEffect, useState } from "react";
import withTabbar from "hoc/withTabbar";
import MstContext from "containers/mst-context/context";
import { setContactId, setControlRadio, getContactId, getRadioUuid } from "misc/env";
import RadioService from "services/radio-service";
import { LOCAL_MACHINE_ID, LOCAL_NET_IP } from "misc/env";
import ContactTableService from "services/contact-table-service";
import useCmdSender from "socket/command-sender";
import useCmdAckHandler from "./useCmdAckHandler";
import MstPanel from "components/mst-panel";
import McIcon from "components/mc-icon";
import McTxList from "components/mc-tx-list";
import McRxList from "components/mc-rx-list";
import McSentList from "components/mc-sent-list";
import { FolderOutlined, ContactsOutlined, EditOutlined } from "@ant-design/icons";
import McButton from "components/mc-button";
import { useHistory } from "react-router";
import McCommonSelect from "components/mc-common-select";
import message from "misc/message";
import McContactViewModal from "components/mc-contact-table/contact-view-modal";

const McWorkbenchHomePage: FC = () => {
  const history = useHistory();
  const [editContact, setEditContact] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [contactId] = useState<String>(getContactId());
  const [radioUuid] = useState<String>(getRadioUuid());
  const radioIp = LOCAL_NET_IP;

  //加载本终端信息
  // const [radio, setRadio] = useState<IRadioItem>();
  const { appType } = useContext(MstContext);
  const [contactTable, setContactTable] = useState<ISysContactTable>();
  const [radio, setRadio] = useState<IRadioItem>();

  useEffect(() => {
    RadioService.getRadio(LOCAL_MACHINE_ID).then(data => {
      if (data && data.contactId) {
        setRadio(data);
        ContactTableService.getContactTable(data.contactId + "").then(data2 => {
          if (data) {
            setContactTable(data2);
            setContactId(data2.id + "");
          }
        });
      } else {
        const radio: IRadioItem = {
          contactId: contactTable?.id || 1,
          uuid: LOCAL_MACHINE_ID,
          ip: LOCAL_NET_IP,
          stationUuid: "",
          name: "自动收发报客户端",
          code: "1001",
          type: "SENSINTEL-CW-TERMINAL-1",
          workStatus: 0,
          userAccountUuid: "",
          account: "GuoGuang",
          userName: "remote",
          delFlag: 0,
          remark: "",
          createUserUuid: "",
          updateUserUuid: "",
          createdAt: "",
          updatedAt: "",
          timeLong: "",
          completeNumber: 0,
          incompleteNumber: 0,
          taskStatus: 0,
          timeStart: "",
          datagramName: "",
          beginTime: "",
          createTime: "",
          active: false,
          libraryVersion: "1.0",
          authorizationFlag: 1,
          status: 0,
        };
        RadioService.createRadio(radio).then(() => {
          // window.location.reload();
          setRadio(radio);
        });
      }
    });
  }, [contactTable?.id]);

  const send = useCmdSender();
  const processCmdAck = (ackData: AckData) => {
    const cmd = ackData.cmd;
    switch (cmd) {
      case "rtGetRadioInfo-ack":
        setControlRadio(ackData.radioUuid, ackData.data?.ip);
        break;
      default:
      //do nothing
    }
  };
  useCmdAckHandler(processCmdAck);
  // useEffect(() => {
  //   const cmd: Command = {
  //     cmd: "rtGetRadioInfo",
  //     radioUuid: LOCAL_MACHINE_ID,
  //   };
  //   send(cmd);
  // }, [appType, send]);

  useEffect(() => {
    const keyEventHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditContact(false);
      }
    };
    document.body.addEventListener("keydown", keyEventHandler);
    return () => document.body.removeEventListener("keydown", keyEventHandler);
  }, []);

  return (
    <Layout className="mc-home">
      <div className="mc-home-title">工作台</div>
      <div className="mc-home-content">
        <div className="mc-home-column">
          <MstPanel className="control-panel" title="快速开始">
            <div className="control-panel-row">
              <div className="recv-btn">
                <div className="left">
                  <McIcon>radar</McIcon>收报
                </div>
                <div className="right">
                  <div
                    className="type-cw"
                    onClick={() => {
                      history.push(
                        `/cw?radioUuid=${radioUuid}&ip=${radioIp}&mode=rx&type=CCK&datagramType=TELR&contactId=${contactId}`
                      );
                    }}
                  >
                    等幅报
                  </div>
                  <div
                    className="type-ex"
                    onClick={() => {
                      history.push(
                        `/cw?radioUuid=${radioUuid}&ip=${radioIp}&mode=rx&type=EX&datagramType=TELR&contactId=${contactId}`
                      );
                    }}
                  >
                    无线电信号
                  </div>
                </div>
              </div>
              <div
                className="send-btn"
                onClick={() => {
                  history.push(
                    `/cw?radioUuid=${radioUuid}&ip=${radioIp}&mode=tx&contactId=${contactId}&datagramType=TELS`
                  );
                }}
              >
                <McIcon>antenna</McIcon> 发报
              </div>
            </div>
            <div className="control-panel-row">
              <div className="telegram-btn">
                <div className="left">
                  <McIcon size={32}>keyboard</McIcon> 办报
                </div>
                <div className="right">
                  <div className="type-cw" onClick={() => history.push("/telegram/input?type=CW")}>
                    等幅报
                  </div>
                  <div className="type-ex" onClick={() => history.push("/telegram/input?type=EX")}>
                    无线电信号
                  </div>
                </div>
              </div>
              <div className="contact-ctrl">
                <div
                  className="current-contact-table"
                  title="当前使用的联络文件"
                  onClick={() => setContactModal(true)}
                >
                  <ContactsOutlined />
                  联络文件
                </div>
                {editContact ? (
                  <>
                    <McCommonSelect
                      idPropName="id"
                      valuePropName="contactName"
                      allowAll={false}
                      itemName="联络文件"
                      selectedId={radio?.contactId + ""}
                      items={ContactTableService.getAllContactTables}
                      onChange={(data: ISysContactTable) => {
                        if (data) {
                          setContactTable(data);
                          setContactId(data?.id + "");
                          const _radio = { ...radio, contactId: data.id };
                          setRadio(_radio);
                          RadioService.saveRadio(_radio).then(success => {
                            if (success) {
                              message.success("修改默认联络文件成功！");
                              setEditContact(false);
                            } else {
                              message.failure("修改默认联络文件失败！");
                            }
                          });
                        } else {
                          setContactTable(null);
                          setContactId("");
                          setEditContact(false);
                        }
                      }}
                    />
                  </>
                ) : (
                  <div className="contact-table-select">
                    <div
                      className="contact-table-name"
                      onClick={e => {
                        setEditContact(true);
                      }}
                    >
                      {" " + contactTable?.contactName}{" "}
                      <EditOutlined
                        onClick={e => {
                          setEditContact(true);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </MstPanel>
          <MstPanel
            title={
              <>
                <div className="rx-title">
                  <div className="rx-name">
                    <FolderOutlined /> 报底
                  </div>
                </div>
                <div className="rx-entrance">
                  <McButton type="primary" onClick={() => history.push("/files/draft")}>
                    更多
                  </McButton>
                </div>
              </>
            }
          >
            <McTxList pageSize={8} />
          </MstPanel>
        </div>
        <div className="mc-home-column">
          <MstPanel
            title={
              <>
                <div className="rx-title">
                  <div className="rx-name">
                    <McIcon>outbox</McIcon>已发报文
                  </div>
                </div>
                <div className="rx-entrance">
                  <McButton type="primary" onClick={() => history.push("/files/sent")}>
                    更多
                  </McButton>
                </div>
              </>
            }
          >
            <McSentList />
          </MstPanel>
          <MstPanel
            title={
              <>
                <div className="rx-title">
                  <div className="rx-name">
                    <McIcon>inbox</McIcon>已收报文
                  </div>
                </div>
                <div className="rx-entrance">
                  <McButton type="primary" onClick={() => history.push("/files/recv")}>
                    更多
                  </McButton>
                </div>
              </>
            }
          >
            <McRxList />
          </MstPanel>
        </div>
      </div>
      {contactModal && (
        <McContactViewModal
          onClose={() => setContactModal(false)}
          contactId={contactTable ? contactTable.id + "" : ""}
          contactName={contactTable ? contactTable.contactName : ""}
        />
      )}
    </Layout>
  );
};

export default withTabbar(McWorkbenchHomePage)("home");

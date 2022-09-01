import "./index.less";
import { Button, Dropdown, Input, Layout, Menu } from "antd";
import React, { FC, useContext, useEffect, useState } from "react";
import Box from "components/mc-box";
import Icon from "components/mc-icon";
import Body from "components/mc-body";
// import Panel from "components/mc-panel";
import withTabbar from "hoc/withTabbar";
import Header from "containers/mc-header-terminal";
// import { useHistory } from "react-router";
import McButton from "components/mc-button";
import { SendOutlined, SaveOutlined, EditOutlined } from "@ant-design/icons";
import MstPanel from "components/mst-panel";
import McTaskList from "components/mc-task-list";
import MstContext from "containers/mst-context/context";
import { getContactId, getRadioUuid, localUse, setContactId } from "misc/env";
import { useHistory } from "react-router";
import RadioService from "services/radio-service";
import { LOCAL_MACHINE_ID } from "misc/env";
import McIcon from "components/mc-icon";
import ContactTableService from "services/contact-table-service";
import { GlobalOutlined } from "@ant-design/icons";
import useCmdSender from "socket/command-sender";
import useCmdAckHandler from "./useCmdAckHandler";
import message from "misc/message";
import McCommonSelect from "components/mc-common-select";

const McWorkbenchHomePage: FC = () => {
  const history = useHistory();
  const { radioIp } = useContext(MstContext);
  const [updateCnt, setUPdateCnt] = useState<number>(0);
  const [radioUuid] = useState<String>(getRadioUuid);
  const [contactId] = useState<String>(getContactId);
  const [editName, setEditName] = useState(false);
  const [editContact, setEditContact] = useState(false);
  //加载本终端信息
  const [radio, setRadio] = useState<IRadioItem>();
  const { appType } = useContext(MstContext);
  const [contactTable, setContactTable] = useState<ISysContactTable>();
  useEffect(() => {
    RadioService.getRadio(LOCAL_MACHINE_ID).then(data => {
      setRadio(data);
      ContactTableService.getContactTable(data?.contactId + "").then(data => setContactTable(data));
    });
  }, []);

  const send = useCmdSender();
  const processCmdAck = (ackData: AckData) => {
    const cmd = ackData.cmd;
    // alert(ackData.data.message);
    switch (cmd) {
      case "rtRadioStandby-ack":
        if (ackData.rc === -1) {
          // alert(-1);
          // setConfigFlag(true);
        } else {
          // alert("设置发报成功！")
          // setConfigFlag(false);
        }
        break;
      case "rtSendTelegramComplete-ack":
        if (ackData.rc === -1) {
          // alert(-1);
          // setConfigFlag(true);
        } else {
          // alert("设置发报成功！")
          // setConfigFlag(false);
        }
        break;
      case "rtRemindTask-ack":
        setUPdateCnt(x => x + 1);
        break;
      default:
      //do nothing
    }
  };
  useCmdAckHandler(processCmdAck);

  useEffect(() => {
    if (appType === "terminal") {
      const cmd: Command = {
        cmd: "rtRadioStandby",
        radioUuid: radioUuid + "",
      };
      // alert(2);
      send(cmd);
    }
    // logInfo("进入收报界面，开始收报");
  }, [appType, radioUuid, send]);

  useEffect(() => {
    const keyEventHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditName(false);
        setEditContact(false);
      }
    };
    document.body.addEventListener("keydown", keyEventHandler);
    return () => document.body.removeEventListener("keydown", keyEventHandler);
  }, []);

  return (
    <Layout className="mc-workbench-page">
      <Layout.Header>
        <Header>智能收发报工作台</Header>
      </Layout.Header>
      <Layout.Content>
        <Body className="mc-workbench-page__body">
          <div className="mc-workbench-page__main">
            <div className="mc-workbench-page__image" />
            <div className="mc-workbench-page__divider" />
            <div className="mc-workbench-page__radio-info">
              <div className="mc-workbench__radio-info-name radio-info">
                <McIcon>radio</McIcon> :
                {editName && localUse ? (
                  <>
                    <Input
                      value={radio?.name}
                      onChange={e => setRadio({ ...radio, name: e.currentTarget.value })}
                    />
                    <SaveOutlined
                      onClick={() => {
                        RadioService.saveRadio(radio).then(success => {
                          if (success) {
                            message.success("修改设备名称成功！");
                          } else {
                            message.failure("修改设备名称失败！");
                          }
                        });
                        setEditName(false);
                      }}
                    />
                  </>
                ) : (
                  <>
                    {" " + radio?.name}
                    {localUse && <EditOutlined onClick={() => setEditName(true)} />}
                  </>
                )}
              </div>
              <div className="radio-info-content  radio-info">
                IP : {localUse ? "[脱网使用]" : radio?.ip}
              </div>
              <div className="radio-info-network radio-info">
                <GlobalOutlined /> :
                {editContact ? (
                  <>
                    <McCommonSelect
                      idPropName="id"
                      valuePropName="contactName"
                      allowAll={false}
                      itemName="默认网系"
                      selectedId={radio.contactId + ""}
                      items={ContactTableService.getAllContactTables}
                      onChange={(data: ISysContactTable) => {
                        if (data) {
                          setContactTable(data);
                          setContactId(data?.id + "");
                        } else {
                          setContactTable(undefined);
                          setContactId("");
                        }
                      }}
                    />
                    <SaveOutlined
                      onClick={() => {
                        const _radio = { ...radio, contactId: contactTable.id };
                        setRadio(_radio);
                        RadioService.saveRadio(_radio).then(success => {
                          if (success) {
                            message.success("设置默认网系成功！");
                          } else {
                            message.failure("设置默认网系失败！");
                          }
                        });
                        setEditContact(false);
                      }}
                    />
                  </>
                ) : (
                  <>
                    {" " + contactTable?.contactName}{" "}
                    <EditOutlined onClick={() => setEditContact(true)} />
                  </>
                )}
              </div>
            </div>
            <div className="mc-workbench-page__board">
              <div className="mc-workbench-page__board__left">
                <div className="mc-workbench-page__board-title">
                  <Icon size="6px">dot</Icon>
                  <Box paddingLeft="10px">请选择右侧收发报任务执行，或者点击下方按钮直接工作</Box>
                </div>
                <Button
                  type="primary"
                  className="terminal_action_btn"
                  onClick={() => {
                    history.push(
                      `/cw?radioUuid=${radioUuid}&ip=${radioIp}&mode=tx&contactId=${contactId}&datagramType=TELS`
                    );
                  }}
                >
                  开始发报
                  <SendOutlined rotate={-45} style={{ marginBottom: 2 }} />
                </Button>

                <Dropdown
                  placement="topLeft"
                  overlay={
                    <Menu>
                      <Menu.Item
                        onClick={() => {
                          history.push(
                            `/cw?radioUuid=${radioUuid}&ip=${radioIp}&mode=rx&type=CCK&datagramType=TELR&contactId=${contactId}`
                          );
                        }}
                      >
                        CW
                      </Menu.Item>
                      {/*<Menu.Item*/}
                      {/*  onClick={() => history.push("/cw?mode=rx&datagramType=TELR&type=CW")}*/}
                      {/*>*/}
                      {/*  KCB*/}
                      {/*</Menu.Item>*/}
                      <Menu.Item
                        onClick={() => {
                          history.push(
                            `/cw?radioUuid=${radioUuid}&ip=${radioIp}&mode=rx&type=EX&datagramType=TELR&contactId=${contactId}`
                          );
                        }}
                      >
                        EX
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button
                    type="primary"
                    className="terminal_action_btn_recv"
                    // onClick={() => {
                    //   history.push(
                    //     `/cw?radioUuid=${radioUuid}&ip=${radioIp}&mode=rx&datagramType=TELR&contactId=${contactId}`
                    //   );
                    // }}
                  >
                    开始收报
                    <SendOutlined rotate={135} style={{ marginTop: 6 }} />
                  </Button>
                </Dropdown>
              </div>
              <MstPanel className="mc-workbench-page__board__right" title="办报入口">
                <McButton
                  type="primary"
                  icon="camera"
                  onClick={() => history.push("/telegram/scan?type=CW&mode=video")}
                >
                  拍照识别
                </McButton>
                <McButton type="primary" icon="file" onClick={() => history.push("/files/import")}>
                  文件识别
                </McButton>
                <Dropdown
                  placement="topLeft"
                  overlay={
                    <Menu>
                      <Menu.Item onClick={() => history.push("/telegram/code?type=EX")}>
                        EX
                      </Menu.Item>
                      <Menu.Item onClick={() => history.push("/telegram/code?type=CW")}>
                        CW
                      </Menu.Item>
                      {/*<Menu.Item onClick={() => history.push("/telegram/code?type=KCB")}>*/}
                      {/*  KCB*/}
                      {/*</Menu.Item>*/}
                    </Menu>
                  }
                >
                  <McButton type="primary" icon="grid">
                    手动录入
                  </McButton>
                </Dropdown>
              </MstPanel>
            </div>
          </div>
          <div className="workbench_right_ul">
            <McTaskList
              contactTableId={parseInt(contactId + "")}
              reload={updateCnt % 2 === 0}
              className="workbench-task-list"
            />
          </div>
        </Body>
      </Layout.Content>
    </Layout>
  );
};

export default withTabbar(McWorkbenchHomePage)("workbench");

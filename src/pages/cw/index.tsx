import "./index.less";
import { Dropdown, Menu } from "antd";
import React, { FC, useEffect, useMemo } from "react";
import Body from "components/mc-body";
import useForm from "./useForm";
import useInit from "./useInit";
import useState from "hooks/useState";
import { useLocation } from "react-router";
import qs from "query-string";
import McReadyCwPage from "pages/tx/ready/indexcw";
import TelegramListModal from "./telegramListModal";
import McRxPage from "pages/rx/index";
import McButton from "components/mc-button";
import { CalendarOutlined, SwapOutlined } from "@ant-design/icons";
import { useHistory } from "react-router";
import { getAppType, LOCAL_MACHINE_ID as radioUuid } from "misc/env";
import useCmdSender from "socket/command-sender";
// import RadioService from "services/radio-service";
import useSocket from "./useSocket";
import useSender from "./useSender";

const MstDatagramPage: FC = () => {
  const socket = useSocket();
  const history = useHistory();
  const location = useLocation();

  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const datagramDraftUuid = search.datagramDraftUuid ? (search.datagramDraftUuid as string) : "";
  const datagramType = search.datagramType as string;
  const dir = search.dir ? (search.dir as string) : "";
  const type = search.type as string;
  const showFlag = search.filetype ? true : false;
  const showButton = search.show ? true : showFlag ? true : false;
  const appType = getAppType();

  // const { appType, radioUuid, contactId, radioIp } = useContext(MstContext);

  // datagramDraftUuid ? setUuid(datagramDraftUuid) : setUuid("");
  const [form, setForm, setFormProp] = useForm();
  useInit(setForm);

  const sender = useSender(socket);
  // const send = useSender();
  // 收发切换标示
  const [sendFlag, setSendflag] = useState<Boolean>(datagramType === "TELS" ? true : false);

  // const [title, setTitle] = useState<string>("");

  // 要发送的的uuid
  const [uuid] = useState<string>(datagramDraftUuid ? datagramDraftUuid : "");

  //  发报列表标示   从工作台及办报的入口是否显示发报列表
  const [listFlag, setListFlag] = useState<boolean>(
    uuid === "" && dir === undefined ? (datagramType === "TELR" ? false : true) : false
  );

  // const [device, setDevice] = useState<IRadioItem>(null);

  //（总控端）获取当前正在控制的设备
  // useEffect(() => {
  //   if (appType !== "control") return;
  //   const { radioUuid } = getControlRadio();
  //   if (radioUuid) {
  //     RadioService.getRadio(radioUuid).then(radio => setDevice(radio));
  //   }
  // }, [appType]);

  // if (location.search.indexOf("type") > 0) {
  //   const type = search.type as TelegramBizType;
  //   alert(11);
  //   setForm(x => ({
  //     ...x,
  //     type: type,
  //   }));
  // }
  useEffect(() => {
    if (datagramType === "TELR") {
      setFormProp("datagramType")("TELR");
      setSendflag(false);
      // setTitle("接收报文");
    } else {
      setFormProp("datagramType")("TELS");
      setSendflag(true);
      // setTitle("发送报文");
    }
    // if (datagramDraftUuid === "" && datagramType === "TELS") {
    if (dir === "" && datagramType === "TELS") {
      setListFlag(true);
    }
    setForm(x => ({
      ...x,
      type: type,
    }));
  }, [datagramType, datagramDraftUuid, dir, type, setForm, setFormProp]);

  const send = useCmdSender();
  const cmdFinsh: Command = {
    cmd: "rtSendTelegramComplete",
    radioUuid: radioUuid,
  };

  const sendFinish = () => {
    // alert(66);
    if (appType === "terminal") {
      send(cmdFinsh);
    }
    // logInfo("退出发报");
  };

  return (
    <div className="cw-home-page">
      <Body className="datagram-body">
        <div className="datagram-body_all-card" id="mc-cw-middle-content">
          {/* <div className="datagram-body_all-card_middle_top-card">
              <div className="top-title">
                {appType === "control" && device && (
                  <div className="control-radio-info">
                    <span>正在远控：</span>
                    <McIcon>radio</McIcon> {device.name}
                  </div>
                )}{" "}
                <div className="operation-info">
                  {datagramType === "TELR" ? (
                    <McIcon>rx</McIcon>
                  ) : (
                    <McIcon>tx</McIcon>
                  )}
                  {form.contactStation
                    ? form.contactStation.primaryFlag
                      ? "主台: "
                      : "属台: "
                    : " "}
                  {form.contactStation?.stationName} 等幅报-{title} （{form.cwTitle}
                </div>
              </div>
            </div> */}
          <>
            {sendFlag && (
              <>
                <McReadyCwPage uuid={uuid} cwForm={form} setCwForm={setForm} listFlag={listFlag} />
                <div
                  style={{
                    display: "none",
                    width: "90%",
                    flexDirection: "row",
                    marginBottom: "20px",
                    justifyContent: "flex-end",
                  }}
                >
                  {/*<div className="switch-wrapper">*/}
                  {/*  <McPhyStatusTuner ready={form.cwReady} />*/}
                  {/*</div>*/}

                  {!showButton && (
                    <Dropdown
                      placement="topLeft"
                      overlay={
                        <Menu>
                          <Menu.Item
                            onClick={() => history.push("/cw?mode=rx&datagramType=TELR&type=CCK")}
                          >
                            CW
                          </Menu.Item>
                          {/*<Menu.Item*/}
                          {/*  onClick={() => history.push("/cw?mode=rx&datagramType=TELR&type=CW")}*/}
                          {/*>*/}
                          {/*  KCB*/}
                          {/*</Menu.Item>*/}
                          <Menu.Item
                            onClick={() => history.push("/cw?mode=rx&datagramType=TELR&type=EX")}
                          >
                            EX
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <McButton
                        type="primary"
                        // disabled={
                        //   form.contactStation?.linkStatus !== "linked" &&
                        //   form.contactStation?.linkStatus !== "fix"
                        // }
                        style={{ width: "160px", marginLeft: "20px" }}
                        // onClick={() => {
                        //   setFormProp("datagramType")("TELR");
                        //   setSendflag(false);
                        //   setTitle("接收报文");
                        //   // alert(111);
                        //   history.push(`/cw?mode=rx&datagramType=TELR`);
                        // }}
                      >
                        切换至收报
                        <SwapOutlined />
                      </McButton>
                    </Dropdown>
                  )}
                  {!showButton && (
                    <McButton
                      type="primary"
                      className="middle-content-right_bottom_button"
                      style={{ width: "180px", marginLeft: "20px" }}
                      onClick={() => {
                        listFlag ? setListFlag(false) : setListFlag(true);
                      }}
                    >
                      打开发报列表
                      <CalendarOutlined />
                    </McButton>
                  )}
                </div>
              </>
            )}
            {!sendFlag && (
              <div style={{ width: "100%", height: "100%" }}>
                <div style={{ width: "100%", height: "100%" }}>
                  <McRxPage cwForm={form} setCwForm={setForm}></McRxPage>
                </div>
                <div
                  style={{
                    display: "none",
                    width: "90%",
                    flexDirection: "row",
                    marginBottom: "20px",
                    justifyContent: "flex-end",
                  }}
                >
                  {!showButton && (
                    <McButton
                      type="primary"
                      // disabled={
                      //   form.contactStation?.linkStatus !== "linked" &&
                      //   form.contactStation?.linkStatus !== "fix"
                      // }
                      style={{ width: "160px", marginLeft: "20px" }}
                      onClick={() => {
                        // setFormProp("datagramType")("TELS");
                        // setSendflag(true);
                        // setTitle("发送报文");
                        // setListFlag(true);
                        history.push("/cw?mode=tx&datagramType=TELS&type=CCK&showListFlag=true");
                      }}
                    >
                      切换至发报
                      <SwapOutlined />
                    </McButton>
                  )}
                  {!showButton && sendFlag && (
                    <McButton
                      type="primary"
                      className="middle-content-right_bottom_button"
                      style={{ width: "180px", marginLeft: "20px" }}
                      onClick={() => {
                        listFlag ? setListFlag(false) : setListFlag(true);
                      }}
                    >
                      打开发报列表
                      <CalendarOutlined />
                    </McButton>
                  )}
                </div>
              </div>
            )}
          </>
        </div>
        <TelegramListModal
          visible={listFlag}
          onCancel={() => {
            sender.chatCmd("-stopsox sox");
            setTimeout(() => {
              sendFinish();
              setListFlag(false);
              history.push("/home");
            }, 500);
          }}
          hideFun={() => {
            setListFlag(false);
          }}
        />
      </Body>
    </div>
  );
};

export default MstDatagramPage;

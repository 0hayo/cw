import "./index.less";
import React, { FC, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { useHistory, useLocation } from "react-router";
import McHeaderBanner from "./banner";
import { DatePicker, Modal, Switch } from "antd";
import message from "misc/message";
import McClock from "components/mc-clock";
import AppLogo from "images/logo/app-logo.png";
import CodeModal from "./codeModal";
import useForm from "../../pages/rx/useForm";
import qs from "query-string";
import { getContactId } from "misc/env";

interface IProps {
  onBack?: boolean | VoidFunction;
  leading?: ReactElement;
  tailing?: ReactElement;
}

const McHeader: FC<IProps> = props => {
  const history = useHistory();

  // const [toggle, setToggle] = useState(false);
  // const active = useSelector<StoreReducer, TabbarValue>(s => s.ui.tabbar);

  const [watchSwitch, setWatchSwitch] = useState<boolean>(false);
  const [watchTime, setWatchTime] = useState<number>();
  const [codeShow, setCodeShow] = useState(false);
  const [form, setForm] = useForm();
  const location = useLocation();

  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const contactId = search.contactId != null ? (search.contactId as string) : getContactId() ? getContactId() : "0";

  const timer = useRef<NodeJS.Timeout>();


  useEffect(() => {
    // let timer = null;
    if (form.telegramCode && form.otherCode) {
      const t = watchTime - new Date().getTime();
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        history.push({
          pathname: "/rx", state: {
            telegramCode: form.telegramCode,
            otherCode: form.otherCode,
            ownCode: form.ownCode,
            telegramCodeOther: form.telegramCodeOther,
            otherCodeOther: form.otherCodeOther,
            ownCodeOther: form.ownCodeOther,
            workNumber: form.workNumber,
            contactTableId: form.contactTableId,
            autoFlag: form.autoFlag,
            ownName: form.ownName,
            otherName: form.otherName,
          }
        });
        clearTimeout(timer.current);
      }, t);
    }
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line
  }, [form]);


  return (
    <div
      id="swos-app-mc-header"
      className="mc-header"
    // onDoubleClick={() => {
    //   ipcRenderer.send("toggleFullScreen");
    //   const el = document.getElementById("swos-app-mc-header");
    //   if (toggle) {
    //     el.setAttribute("style", "-webkit-app-region: drag");
    //     setToggle(false);
    //   } else {
    //     el.setAttribute("style", "-webkit-app-region: no-drag");
    //     setToggle(true);
    //   }
    // }}
    >
      <div className="mc-header__title">
        <div
          className="mc-header__iconBox"
          style={{ width: 48, height: 48 }}
          onClick={() => history.push("/")}
        >
          <img alt="APP LOGO" src={AppLogo} style={{ width: 40, height: 40 }} />
        </div>
        <div className="mc-header__clockBox">
          <McClock />
        </div>
      </div>
      {/* <div className="mc-header__center">
        <div className="mc-header__center_tab_name">{tabName(active)}</div>
      </div> */}
      <div className="mc-header__center">
        <McHeaderBanner />
        {/* <div className="mc-header__center_tab_name">?????????????????????</div> */}
      </div>
      <div className="mc-header__right">
        <div className="mc-header__clockBox">
          {/* <McClock /> */}
          {/* ?????? */}
          <Switch checkedChildren={"????????????"} unCheckedChildren={"????????????"} checked={watchSwitch} onChange={(checked: boolean) => {
            if (checked) {
              if (watchTime) {
                const t = watchTime - new Date().getTime();
                if (t <= 10000) {
                  message.failure("???????????????????????????????????????");
                  return;
                }
                setCodeShow(true);
                setWatchSwitch(true);
              } else {
                message.failure("???????????????????????????");
              }
            } else {
              setWatchSwitch(false);
            }
          }} />
          <DatePicker showTime onChange={(value: any) => {
            // console.log('Selected Time: ', value._d.getTime()); 
            setWatchTime(value._d.getTime());
          }}
          />
        </div>
        {/* <div className="mc-header__iconBox" onClick={() => history.push("/")}>
          <HomeOutlined title="????????????" className="mc-header__icon" />
        </div> */}
        {/* <div className="mc-header__iconBox" onClick={() => history.push("/setting")}>
          <SettingOutlined title="??????" className="mc-header__icon" />
        </div> */}
        {/* <McTopMenu /> */}
        <div
          className="mc-header__iconBox"
          title="????????????"
          onClick={() => {
            Modal.confirm({
              title: "????????????",
              content: "????????????????????????",
              maskClosable: false,
              centered: true,
              onOk: () => {
                window.close();
                process.exit();
              },
            });
          }}
        >
          <CloseOutlined className="mc-header__icon" />
        </div>
      </div>
      <CodeModal
        visible={codeShow}
        form={form}
        contactTableId={contactId}
        setForm={setForm}
        onShow={() => setCodeShow(false)}
        onCancel={() => {
          // form.body["rmks"].value = "11111";
          if (
            !form.telegramCode ||
            !form.ownCode ||
            !form.otherCode ||
            !form.telegramCodeOther ||
            !form.ownCodeOther ||
            !form.otherCodeOther ||
            !form.workNumber
          ) {
            Modal.confirm({
              centered: true,
              maskClosable: false,
              title: "????????????",
              content: "???????????????????????????????????????????????????????????????",
              onOk: () => {
                setForm(x => ({ ...x, autoFlag: 0 }));
                setCodeShow(false);
                setWatchSwitch(false);
                clearTimeout(timer.current);
              },
            });
          } else {
            setCodeShow(false);
          }
        }}
      />
    </div>
  );
};

export default McHeader;

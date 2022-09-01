import "./codeModal.less";
import React, { FC, useEffect, useState } from "react";
import { Button, Select, Input } from "antd";
import fetch from "utils/fetch";
import message from "misc/message";
import { IForm } from "../typing";
import McModalNice from "components/mc-modal-nice";
import ContactTableService from "services/contact-table-service";
import TelegramCodePanel from "components/mc-contact-table/telegram-code";
import useMounted from "hooks/useMounted";

interface IProps {
  visible: boolean;
  contactTableId?: string;
  onCancel?: VoidFunction;
  form?: IForm;
  setForm?: (x) => void;
  sendCmd?: (s) => void;
  onShow: VoidFunction;
}

interface IContactList {
  items: IContactListItem[];
}
interface IContactListItem {
  id: number;
  contactName: string;
}

let isSelectValid = false;

const CodeModal: FC<IProps> = ({
  visible,
  contactTableId,
  onCancel,
  form,
  setForm,
  sendCmd,
  onShow
}) => {

  const [contactList, setContactList] = useState<IContactList>(null);
  const [contactId, setContactId] = useState<number>(form.contactTableId);

  const [workNumber, setWorkNumber] = useState<string>(
    form.workNumber || localStorage.getItem("WORK_NUM") || ""
  );

  //本台信息
  const [ownName, setOwnName] = useState(form.ownName);
  const [telegramCode, setTelegramCode] = useState<string>(form.telegramCode);
  const [ownCode, setOwnCode] = useState<string>(form.ownCode);
  const [otherCode, setOtherCode] = useState<string>(form.otherCode);
  //他台信息
  const [otherName, setOtherName] = useState(form.otherName);
  const [telegramCodeOther, setTelegramCodeOther] = useState<string>(form.telegramCodeOther);
  const [ownCodeOther, setOwnCodeOther] = useState<string>(form.ownCodeOther);
  const [otherCodeOther, setOtherCodeOther] = useState<string>(form.otherCodeOther);
  const mounted = useMounted();

  useEffect(() => {
    setContactId(form.contactTableId);
  }, [form.contactTableId]);

  // useEffect(() => {
  //   console.log(history);
  //   if (history.location.state) {
  //     // const state = history.location.state as any;
  //     // setTelegramCode(state.telegramCode);
  //     // setOtherCode(state.otherCode);
  //     // setOwnCode(state.ownCode);
  //     // setTelegramCodeOther(state.telegramCodeOther);
  //     // setOtherCodeOther(state.otherCodeOther);
  //     // setOwnCodeOther(state.ownCodeOther);
  //     // setWorkNumber(state.workNumber);
  //     // setContactId(state.contactTableId);
  //     // // setWorkNumber(state.autoFlag);
  //     // setOwnName(state.ownName);
  //     // setOtherName(state.otherName);

  //     setTimeout(() => {
  //       commit();
  //     }, 1000);
  //   }
  //   // eslint-disable-next-line
  // }, [history]);

  // 请求网系列表
  useEffect(() => {
    if (!mounted.current) return;
    isSelectValid = false;
    const pageJson = {
      currentPage: 1,
      pageSize: 100,
    };
    const wait = fetch.post<ManageResponse>("/sysContactTable/listPage", JSON.stringify(pageJson));
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) {
        setContactList(x => ({ ...x, items: result.data.items }));
      }

      //获取联络文件表的本台信息
      if (!contactId) return;
      ContactTableService.getOwnStationInfo(contactId + "").then(station => {
        if (station) {
          setTelegramCode(station.telegramCode);
          setOwnCode(station.ownCode);
          setOtherCode(station.otherCode);
          const _ownName = `${station.primaryFlag === "Z" ? "主" : "属"}${station.belongSeq && station.belongSeq !== 0 ? station.belongSeq : ""
            }台`;
          setOwnName(_ownName);
        }
      });
    });
  }, [contactId, mounted, setForm]);

  const commit = () => {
    if (!telegramCode || telegramCode.trim() === "") {
      message.failure("请选择或填写我方电报代号！");
      return;
    }
    if (!otherCode || otherCode.trim() === "") {
      message.failure("请选择或填写我方被呼代码！");
      return;
    }
    if (!ownCode || ownCode.trim() === "") {
      message.failure("请选择或填写我方自用代码！");
      return;
    }
    if (!telegramCodeOther || telegramCodeOther.trim() === "") {
      message.failure("请选择或填写对方电报代号！");
      return;
    }
    if (!otherCodeOther || otherCodeOther.trim() === "") {
      message.failure("请选择或填写对方被呼代码！");
      return;
    }
    if (!ownCodeOther || ownCodeOther.trim() === "") {
      message.failure("请选择或填写对方自用代码！");
      return;
    }
    if (!workNumber || workNumber.trim() === "") {
      message.failure("请填写工号！");
      return;
    }
    message.destroy();

    setForm(x => ({
      ...x,
      telegramCode: telegramCode,
      otherCode: otherCode,
      ownCode: ownCode,
      telegramCodeOther: telegramCodeOther,
      otherCodeOther: otherCodeOther,
      ownCodeOther: ownCodeOther,
      workNumber: workNumber,
      ownName,
      otherName,
      autoFlag: 1,
      contactTableId: contactId,
    }));

    localStorage.setItem("WORK_NUM", workNumber);

    sendCmd(
      "-vvvrecv " +
      contactId +
      "|" +
      telegramCodeOther +
      ";" +
      otherCodeOther +
      ";" +
      ownCodeOther +
      "|" +
      telegramCode +
      ";" +
      otherCode +
      ";" +
      ownCode +
      "|" +
      workNumber
    );
    onShow();
    // onCancel();
    // sendBegin("VVV " + otherCodeOther + " DE " + ownCode + " K");
  };

  return (
    mounted.current && (
      <McModalNice
        title="联络信息"
        centered
        visible={visible}
        className="mc_contact_modal_rx_new"
        footer={null}
        maskClosable={false}
        onCancel={onCancel}
        destroyOnClose={true}
        width={900}
      >
        <div className="contact_modal_content">
          {/* 选择网系 */}
          <div className="modal_list_inline">
            <div className="modal_list_name">联络文件:</div>
            <div className="modal_list_select">
              <Select
                disabled={isSelectValid}
                dropdownClassName="downSelect"
                className="select"
                value={contactId}
                style={{ width: 240 }}
                onChange={(value, option) => {
                  setContactId(value);
                  setOtherName("");
                  setTelegramCodeOther("");
                  setOtherCodeOther("");
                  setOwnCodeOther("");
                }}
              >
                {contactList &&
                  contactList.items.map(item => (
                    <Select.Option value={item.id} key={item.id}>
                      {item.contactName}
                    </Select.Option>
                  ))}
              </Select>
            </div>
            <div className="modal_list_name">工号:</div>
            <Input
              className="modal_input"
              placeholder="请输入您的工号"
              value={workNumber}
              onChange={e => {
                setWorkNumber(e.currentTarget.value.trim());
              }}
            />
          </div>
          <div className="contact_info">
            <div className="modal_list_wrapper">
              <div className="modal_list_title">本台信息：{ownName}</div>
              <div className="modal_list_inputs">
                <div className="modal_list">
                  <div className="modal_list_name">电报代号:</div>
                  <Input
                    className="modal_input"
                    placeholder=""
                    value={telegramCode}
                    onChange={e => {
                      setTelegramCode(e.currentTarget.value);
                    }}
                  />
                </div>
                <div className="modal_list">
                  <div className="modal_list_name">被呼:</div>
                  <Input
                    className="modal_input"
                    placeholder=""
                    value={otherCode}
                    onChange={e => {
                      setOtherCode(e.currentTarget.value);
                    }}
                  />
                </div>
                <div className="modal_list">
                  <div className="modal_list_name">自用:</div>
                  <Input
                    className="modal_input"
                    placeholder=""
                    value={ownCode}
                    onChange={e => {
                      setOwnCode(e.currentTarget.value);
                    }}
                  />
                </div>
              </div>
            </div>
            {/* <div className="center_divider">
              <SwapOutlined />
            </div> */}
            <div className="modal_list_wrapper">
              <div className="modal_list_title">他台信息：{otherName}</div>
              <div className="modal_list_inputs">
                <div className="modal_list">
                  <div className="modal_list_name">电报代号:</div>
                  <Input
                    className="modal_input"
                    placeholder=""
                    value={telegramCodeOther}
                    onChange={e => {
                      setTelegramCodeOther(e.currentTarget.value);
                    }}
                  />
                </div>
                <div className="modal_list">
                  <div className="modal_list_name">被呼:</div>
                  <Input
                    className="modal_input"
                    placeholder=""
                    value={otherCodeOther}
                    onChange={e => {
                      setOtherCodeOther(e.currentTarget.value);
                    }}
                  />
                </div>
                <div className="modal_list">
                  <div className="modal_list_name">自用:</div>
                  <Input
                    className="modal_input"
                    placeholder=""
                    value={ownCodeOther}
                    onChange={e => {
                      setOwnCodeOther(e.currentTarget.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="station-info">
            <TelegramCodePanel
              readonly
              contactId={contactId || form.contactTableId}
              selectedTelegramCode={form.telegramCodeOther}
              onSelect={record => {
                setTelegramCodeOther(record.telegramCode);
                setOtherCodeOther(record.otherCode);
                setOwnCodeOther(record.ownCode);
                const _name = `${record.primaryFlag === "Z" ? "主" : "属"}${record.belongSeq ? record.belongSeq : ""
                  }台`;
                setOtherName(_name);
              }}
            />
          </div>
        </div>
        <div className="modal_footer">
          <Button
            type="primary"
            className="modal_Btn"
            onClick={commit}
          >
            保存联络信息
          </Button>
        </div>

        {/* 选择待发报文 */}
        {/* <McTelegramModal
        visible={false}
        onCancel={() => {
        }}
        onOk={(title, datagramUuid, radioUuid) => {
          setTask({ ...task, datagramUuid, title, radioUuid });
        }}
      /> */}
      </McModalNice>
    )
  );
};

export default CodeModal;

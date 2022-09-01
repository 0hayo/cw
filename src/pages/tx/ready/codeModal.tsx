import "./codeModal.less";
import React, { FC, useEffect, useState } from "react";
import { Button, Select, Input, Switch, DatePicker } from "antd";
import fetch from "utils/fetch";
import message from "misc/message";
import { DUMB_FEED, IForm } from "./typing";
import McModalNice from "components/mc-modal-nice";
import TelegramCodePanel from "components/mc-contact-table/telegram-code";
import ContactTableService from "services/contact-table-service";
import { join, value } from "misc/telegram";

interface IProps {
  visible: boolean;
  onCancel?: VoidFunction;
  form?: IForm;
  setForm?: (x) => void;
  sendCmd?: (s) => void;
  time: number;
  setTime?: (s) => void;
  timing: boolean;
  setTiming?: (s) => void;
  setTbType: (s) => void;
  tbType: boolean;
  onShow: VoidFunction;
}

interface IContactList {
  items: IContactListItem[];
}
interface IContactListItem {
  id: number;
  contactName: string;
}

interface ITelegramLevelList {
  items: ITelegramLevelListItem[];
}
interface ITelegramLevelListItem {
  id: number;
  code: string;
  text: string;
}

let isSelectValid = false;

const CodeModal: FC<IProps> = ({ visible, onCancel, form, setForm, sendCmd, onShow, time, setTime, timing, setTiming, setTbType, tbType }) => {
  const [contactList, setContactList] = useState<IContactList>(null);
  const [contactId, setContactId] = useState<number>(form.contactTableId);

  const [telegramType, setTelegramType] = useState<string>(form.telegramGradeType);
  const [telegramLevelList, setTelegramLevelList] = useState<ITelegramLevelList>(null);
  const [telegramLevel, setTelegramLevel] = useState<string>(
    form.type === "EX" ? "12 加急" : form.telegramGradeCode
  );

  const [workNumber, setWorkNumber] = useState<string>(
    form.workNumber || localStorage.getItem("WORK_NUM") || "" || ""
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

  const [timeCounting, setTimeCounting] = useState<number>();

  // 请求电报等级列表
  useEffect(() => {
    isSelectValid = false;
    if (contactId && telegramType) {
      const wait = fetch.get<ManageResponse>(
        `/sysDatagramGrade/datagram_grade/${contactId}/${telegramType}`
      );
      Promise.resolve(wait).then(response => {
        const result = response.data;
        if (result.status === 1) {
          setTelegramLevelList(x => ({ ...x, items: result.data }));
        }
      });
    }
  }, [contactId, telegramType]);

  useEffect(() => {
    setContactId(form.contactTableId);
  }, [form.contactTableId]);

  // 请求网系列表
  useEffect(() => {
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
  }, [contactId, setForm]);

  return (
    <McModalNice
      title="联络信息"
      centered
      visible={visible}
      className="mc_contact_modal_tx_new"
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
              value={contactId || form.contactTableId}
              onChange={value => {
                setContactId(value);
                setOtherName("");
                setTelegramCodeOther("");
                setOtherCodeOther("");
                setOwnCodeOther("");
              }}
            >
              {contactList &&
                contactList.items.map(item => (
                  <Select.Option value={item.id + ""} key={item.id}>
                    {item.contactName}
                  </Select.Option>
                ))}
            </Select>
          </div>
          {form.type !== "EX" && (
            <>
              <div className="modal_list_name" style={{ marginLeft: 24 }}>
                电报等级:
              </div>
              <div className="modal_list_select">
                <Select
                  disabled={isSelectValid}
                  dropdownClassName="downSelect"
                  value={telegramType}
                  onChange={(value, option) => {
                    setTelegramType(value);
                  }}
                >
                  <Select.Option value="1" key={1}>
                    工作报
                  </Select.Option>
                  <Select.Option value="2" key={2}>
                    训练报
                  </Select.Option>
                </Select>
              </div>
              <div className="modal_list_select">
                <Select
                  disabled={isSelectValid}
                  dropdownClassName="downSelect"
                  value={telegramLevel}
                  onChange={(value, option) => {
                    setTelegramLevel(value);
                  }}
                >
                  {telegramLevelList &&
                    telegramLevelList.items.map(item => (
                      <Select.Option value={item.code + " " + item.text} key={item.id}>
                        {item.code + " " + item.text}
                      </Select.Option>
                    ))}
                </Select>
              </div>
            </>
          )}
          <div className="modal_list_name" style={{ marginLeft: 24 }}>
            工号:
          </div>
          <Input
            className="modal_input"
            placeholder="请输入工号"
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
            selectedTelegramCode={form.telegramCodeOther}
            contactId={contactId || form.contactTableId}
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
        <div className="timing">
          <label className="timing_label">定时发报:</label>
          <Switch onChange={(checked: boolean) => {
            setTiming(checked);
          }} />
          {timing && <DatePicker showTime onChange={(value: any) => {
            setTimeCounting(value._d.getTime());
          }}
          />}
        </div>
        <div className="tb">
          <label className="tb_label">通波:</label>
          <Switch onChange={(checked: boolean) => {
            setTbType(checked);
          }} />
        </div>
      </div>

      <div className="modal_footer">
        <Button
          type="primary"
          className="modal_Btn"
          onClick={() => {
            if (telegramCode === null || telegramCode === "") {
              message.failure("请填写本台电报代号！");
              return;
            }
            if (otherCode === null || otherCode === "") {
              message.failure("请填写本台被呼代码！");
              return;
            }
            if (ownCode === null || ownCode === "") {
              message.failure("请填写本台自用代码！");
              return;
            }
            if (!tbType) {
              if (telegramCodeOther === null || telegramCodeOther === "") {
                message.failure("请选择或填写他台电报代号！");
                return;
              }
              if (otherCodeOther === null || otherCodeOther === "") {
                message.failure("请选择或填写他台被呼代码！");
                return;
              }
              if (ownCodeOther === null || ownCodeOther === "") {
                message.failure("请选择或填写他台自用代码！");
                return;
              }
            }
            if (!telegramLevel) {
              if (form.type !== "EX") {
                message.failure("请选择电报等级！");
                return;
              }
            }
            if (!workNumber || workNumber.trim() === "") {
              message.failure("请填写工号！");
              return;
            }
            if (timing) {
              if (timeCounting) {
                if (timeCounting <= new Date().getTime() + 10000) {
                  message.failure("定时发报时间不能小于当前时间！");
                  return;
                }
              } else {
                message.failure("请选择发报时间！");
                return;
              }
            }
            setTime(timeCounting);
            message.destroy();
            setForm(x => ({
              ...x,
              feed: DUMB_FEED,
              feedRx: DUMB_FEED,
              messages: [],
              telegramCode: telegramCode,
              otherCode: otherCode,
              ownCode: ownCode,
              telegramCodeOther: telegramCodeOther,
              otherCodeOther: otherCodeOther,
              ownCodeOther: ownCodeOther,
              workNumber: workNumber,
              ownName,
              otherName,
              telegramGradeType: telegramType,
              telegramGradeCode: telegramLevel,
              autoFlag: 1,
              contactTableId: contactId,
              telegramLevel: telegramLevel,
              // isTb: tbType ? "TB" : x.type
            }));
            // alert(1);
            setForm(x => {
              x["head"]["RMKS"] = {
                ...x["head"]["RMKS"],
                value: tbType ? "CQ" : telegramCode + " TO " + telegramCodeOther,
                crude: tbType ? "" : telegramCode + " TO " + telegramCodeOther,
                light: true,
                // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
              };
              if (form.type !== "EX") {
                x["head"]["CLS"] = {
                  ...x["head"]["CLS"],
                  value: telegramLevel.split(" ")[0],
                  crude: telegramLevel.split(" ")[0],
                  light: true,
                  // ratio: [-1000, -1000, -1000, -1000, -1000, -1000],
                };
              }
              return {
                ...x,
              };
            });

            localStorage.setItem("WORK_NUM", workNumber);

            // setIsVisible(false);
            if (form.type === "EX") {
              setTelegramLevel("12 加急");
            }
            let cmdStr =
              "-vvvsend " +
              contactId +
              "|" +
              telegramCode +
              ";" +
              otherCode +
              ";" +
              ownCode +
              "|" +
              telegramCodeOther +
              ";" +
              otherCodeOther +
              ";" +
              ownCodeOther +
              "|" +
              (telegramLevel ? telegramLevel.split(" ")[0] : "") +
              "|" +
              workNumber;
            if (tbType) {
              const json = JSON.stringify({
                tag: "TelegramScript",
                isSender: true,
                type: form.type,
                // type: "CCK",
                body: join(form.body),
                nr: value(form.head["NR"]),
                ck: value(form.head["CK"]),
                cls: value(form.head["CLS"]),
                date: value(form.head["DATE"]),
                time: value(form.head["TIME"]),
                rmks: value(form.head["RMKS"]),
              });
              cmdStr = `session -tx -telegram ${json} -dualmode -profile machine`;
            };
            sendCmd(cmdStr);
            onShow();
          }}
        >
          保存联络信息
        </Button>
      </div>

      {/* 选择待发报文 */}
      {/* <McTelegramModal
        visible={false}
        onCancel={() => {
          // setIsTelegram(false);
        }}
        onOk={(title, datagramUuid, radioUuid) => {
          // setProps({ ...propsData, datagramUuid: uuid, datagramTitle: name, radioUuid });
          setTask({ ...task, datagramUuid, title, radioUuid });
          // setIsTelegram(false);
        }}
      /> */}
    </McModalNice>
  );
};

export default CodeModal;

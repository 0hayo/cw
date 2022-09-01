import "./index.less";
import React, { FC, useCallback, useEffect, useState } from "react";
import { CloseCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Checkbox, Form, Input, Radio } from "antd";
import AudioFilePlayer from "components/mc-audio-player/audio-file-player";
import { MstTheme } from "less/theme";
import message from "misc/message";
import ContactTableService from "services/contact-table-service";
import McModalNice from "components/mc-modal-nice";

interface IProps {
  /** 联络文件表ID（用于真伪码转换） */
  contactTableId: number;
  /**
   * 确定处理方式点击确定时的回调
   * @param phrase 根据用户选择最终生成的短语
   */
  onSubmit: (phrase: string) => void;
  /** 取消处理时的回调 */
  onCancel?: () => void;
  /** 要显示的标题 */
  title?: string;
  /** 要显示的说明信息 */
  msg?: string;
  /** 是否播放警示音，默认为true */
  alert?: boolean;
  // initChannel?: string;
  // initFreq?: string;
}

interface InnerData {
  type: ConsultType;
  channel1: string;
  channel2: string;
  myFreq1: boolean;
  freq1: string;
  freq2: string;
  myFreq2: boolean;
}

const EMPTY_DATA: InnerData = {
  type: "check",
  channel1: "",
  channel2: "",
  myFreq1: false,
  freq1: "",
  freq2: "",
  myFreq2: false,
};

const DEFAULT_TITLE = "通信协商";
const DEFAULT_MESSAGE = "当前通信质量差，建议和对方沟通协商后再继续作业。";

/**
 * 收报信道协商对话框
 */
const McRxConsultModal: FC<IProps> = ({
  contactTableId,
  onSubmit,
  onCancel,
  title = DEFAULT_TITLE,
  msg = DEFAULT_MESSAGE,
  alert = true,
  // initChannel = "",
  // initFreq = ""
}) => {
  const [goAlert, setGoAlert] = useState(alert);
  const [show, setShow] = useState(true);
  const [data, setData] = useState(EMPTY_DATA);
  const [reason, setReason] = useState("%");
  const [phrase, setPhrase] = useState("");
  const [maskCodeList, setMaskCodeList] = useState<IMaskCode[]>();
  const [trainedCode, setTrainedCode] = useState("");

  const stopAlert = () => {
    setGoAlert(false);
  };

  /** 点击鼠标或键盘时停止报警 */
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      stopAlert();
    };
    const keyHandler = (e: KeyboardEvent) => {
      stopAlert();
    };
    document.body.addEventListener("click", clickHandler);
    document.body.addEventListener("keydown", keyHandler);
    return () => {
      document.body.removeEventListener("click", clickHandler);
      document.body.removeEventListener("keydown", keyHandler);
    };
  }, []);

  useEffect(() => {
    ContactTableService.getMaskCodeList(contactTableId).then(data => setMaskCodeList(data));
  }, [contactTableId]);

  const getPhrase = useCallback(
    (check: boolean): string | boolean => {
      if (!reason) {
        if (check) {
          message.failure("请先选择协商原因。");
          return false;
        }
      }

      if (data.type === "check") {
        //请求对方检查通信设备
        return `${reason} PSE CK`; //OR "HR KP QSB PSE CK YR XMTR ES PWR";
      } else if (data.type === "unilateral") {
        //单方改频：

        //切换到我方频率
        if (data.myFreq1) {
          return `HR ${reason} PSE QSY TO HR FREQ K`;
        }

        if (check && !data.channel1 && !data.freq1) {
          message.failure("信道和频率必须填写一个。");
          return false;
        }

        const intChannel = parseInt(data.channel1);
        if (check && data.channel1 && (!intChannel || intChannel < 1 || intChannel > 99)) {
          message.failure("信道必须为大于0小于99的整数。");
          return false;
        }
        const intFreq = parseInt(data.freq1);
        if (check && data.freq1 && (!intFreq || intFreq < 1 || intFreq > 9999)) {
          message.failure("频率必须为大于0小于9999的整数。");
          return false;
        }

        if (data.channel1) {
          return `HR ${reason} PSE QSY TO ${data.channel1} CHAN K`;
        } else if (data.freq1) {
          const result = ContactTableService.translateToMaskCode(maskCodeList, data.freq1);
          if (!result.success) {
            message.failure("真伪码转换错误", result.error);
            return false;
          }
          setTrainedCode(result.maskCode);
          return `HR ${reason} PSE QSY TO ${result.maskCode} K`;
        }
      } else {
        //双方改频：

        //切换到我方频率
        if (data.myFreq2) {
          return `HR ${reason} BOZ TO HR FREQ K`;
        }

        if (check && !data.channel2 && !data.freq2) {
          message.failure("信道和频率必须填写一个。");
          return false;
        }
        const intChannel = parseInt(data.channel2);
        if (check && data.channel2 && (!intChannel || intChannel < 1 || intChannel > 99)) {
          message.failure("信道必须为大于0小于99的整数。");
          return false;
        }
        const intFreq = parseInt(data.freq2);
        if (check && data.freq2 && (!intFreq || intFreq < 1 || intFreq > 9999)) {
          message.failure("频率必须为大于0小于9999的整数。");
          return false;
        }

        if (data.channel2) {
          return `HR ${reason} BOZ QSY TO ${data.channel2} CHAN K`;
        } else if (data.freq2) {
          const result = ContactTableService.translateToMaskCode(maskCodeList, data.freq2);
          if (!result.success) {
            message.failure("真伪码转换错误", result.error);
            return false;
          }
          setTrainedCode(result.maskCode);
          return `HR ${reason} BOZ QSY TO ${result.maskCode} K`;
        }
      }
    },
    [data, reason, maskCodeList]
  );

  useEffect(() => {
    const _phrase = getPhrase(false);
    setPhrase(_phrase as string);
  }, [reason, data, getPhrase]);

  return (
    <McModalNice
      title={title}
      visible={show}
      centered
      maskClosable={false}
      className="mst-rx-consult-modal"
      wrapClassName="mst-rx-consult-modal-wrap alert-animated infinite alert-flash"
      onOk={() => {
        const _phrase = getPhrase(true);
        if (_phrase) {
          onSubmit(_phrase as string);
          setShow(false);
        }
      }}
      onCancel={() => (onCancel ? onCancel() : setShow(false))}
      cancelText="取消"
      width="50%"
      cancelButtonProps={{
        size: "large",
        icon: <CloseCircleOutlined />,
        style: {
          fontSize: 20,
          fontWeight: 500,
          backgroundColor: MstTheme.mc_warning_color,
          border: 0,
          color: MstTheme.mc_text_color,
        },
      }}
      okButtonProps={{
        size: "large",
        icon: <CheckCircleOutlined />,
        style: {
          fontSize: 20,
          fontWeight: 500,
          border: 0,
          color: MstTheme.mc_text_color,
        },
      }}
      maskStyle={
        goAlert
          ? {
              animation: "rx-alert 1000ms infinite",
              WebkitAnimation: "rx-alert 1000ms infinite",
            }
          : {}
      }
    >
      <div className="alert-content">
        <div className="alert-text">{msg}</div>
        <div className="tip-text">请选择协商原因：</div>
        <div className="process-options">
          <Form className="consult-reasons">
            <Radio
              className="consult-reason"
              checked={reason === "QSA1"}
              onClick={() => setReason("QSA1")}
            >
              信号很弱 (QSA)
            </Radio>
            <Radio
              className="consult-reason"
              checked={reason === "QSB"}
              onClick={() => setReason("QSB")}
            >
              信号衰减 (QSB)
            </Radio>
            <Radio
              className="consult-reason"
              checked={reason === "QRM"}
              onClick={() => setReason("QRM")}
            >
              他台干扰 (QRM)
            </Radio>
            <Radio
              className="consult-reason"
              checked={reason === "QRN"}
              onClick={() => setReason("QRN")}
            >
              天电干扰 (QRN)
            </Radio>
          </Form>
        </div>
        <div className="tip-text">请选择协商方式：</div>
        <div className="process-options">
          <Form layout="vertical">
            <Form.Item>
              <Radio
                checked={data.type === "check"}
                onClick={() => {
                  setData({ ...EMPTY_DATA, type: "check" });
                }}
              >
                请求对方检查通信设备
              </Radio>
            </Form.Item>
            <Form.Item>
              <Radio
                checked={data.type === "unilateral"}
                onClick={() => {
                  if (data.type !== "unilateral") {
                    setData({ ...EMPTY_DATA, type: "unilateral" });
                  }
                }}
              >
                请求单方改频：
              </Radio>
              <div className="operation-options">
                <div className="operation-option">
                  切换到信道：
                  <Input
                    type="number"
                    value={data.channel1}
                    max={99}
                    min={1}
                    onFocus={() => {
                      setData({ ...EMPTY_DATA, channel1: data.channel1, type: "unilateral" });
                    }}
                    onChange={e => {
                      setData({
                        ...EMPTY_DATA,
                        channel1: e.currentTarget.value,
                        type: "unilateral",
                      });
                    }}
                  />
                </div>
                <div className="operation-or">或</div>
                <div className="operation-option">
                  切换到频率：
                  <Input
                    type="number"
                    value={data.freq1}
                    max={9999}
                    min={1}
                    onFocus={() => {
                      setData({ ...EMPTY_DATA, freq1: data.freq1, type: "unilateral" });
                    }}
                    onChange={e => {
                      setData({ ...EMPTY_DATA, freq1: e.currentTarget.value, type: "unilateral" });
                    }}
                  />
                  (KHz)
                  <div className="mask-code">
                    {trainedCode && data.type === "unilateral" ? `伪码： ${trainedCode}` : ""}
                  </div>
                </div>
                <div className="operation-or">或</div>
                <div className="operation-option">
                  <Checkbox
                    checked={data.myFreq1}
                    onClick={e => setData({ ...EMPTY_DATA, type: "unilateral", myFreq1: true })}
                  >
                    切换到我方频率
                  </Checkbox>
                </div>
              </div>
            </Form.Item>
            <Form.Item>
              <Radio
                checked={data.type === "bilateral"}
                onClick={() => {
                  if (data.type !== "bilateral") {
                    setData({ ...EMPTY_DATA, type: "bilateral" });
                  }
                }}
              >
                请求双方改频：
              </Radio>
              <div className="operation-options">
                <div className="operation-option">
                  切换到信道：
                  <Input
                    type="number"
                    value={data.channel2}
                    max={99}
                    min={1}
                    onFocus={() => {
                      setData({ ...EMPTY_DATA, channel2: data.channel2, type: "bilateral" });
                    }}
                    onChange={e => {
                      setData({
                        ...EMPTY_DATA,
                        channel2: e.currentTarget.value,
                        type: "bilateral",
                      });
                    }}
                  />
                </div>
                <div className="operation-or">或</div>
                <div className="operation-option">
                  切换到频率：
                  <Input
                    type="number"
                    value={data.freq2}
                    max={9999}
                    min={1}
                    onFocus={() => {
                      setData({ ...EMPTY_DATA, freq2: data.freq2, type: "bilateral" });
                    }}
                    onChange={e => {
                      setData({ ...EMPTY_DATA, freq2: e.currentTarget.value, type: "bilateral" });
                    }}
                  />
                  (KHz)
                  <div className="mask-code">
                    {trainedCode && data.type === "bilateral" ? `伪码： ${trainedCode}` : ""}
                  </div>
                </div>
                <div className="operation-or">或</div>
                <div className="operation-option">
                  <Checkbox
                    checked={data.myFreq2}
                    onClick={e => setData({ ...EMPTY_DATA, type: "bilateral", myFreq2: true })}
                  >
                    切换到我方频率
                  </Checkbox>
                </div>
              </div>
            </Form.Item>
          </Form>
          <div className="tips">* 频率请输入真码，会自动转换成伪码</div>
          <div className="phrase-preview">
            <input
              value={phrase ? phrase : ""}
              onChange={e => setPhrase(e.currentTarget.value)}
              spellCheck={false}
            />
          </div>
        </div>
      </div>
      {goAlert && <AudioFilePlayer fileName="alert2.mp3" />}
    </McModalNice>
  );
};

export default McRxConsultModal;

import "./index.less";
import React, { FC, useEffect, useState } from "react";
import McButton from "components/mc-button";
import { Form, Radio } from "antd";
import { position } from "misc/telegram";
import McModalNice from "components/mc-modal-nice";

interface IProps {
  title: string;
  visible: boolean;
  role: "head" | "body";
  /** 报文第几页 */
  page: number;
  /** 报文大小 */
  size: number;
  /** 选择的报文起始位置 */
  dx: number;
  /** 选择的报文结束位置 */
  dy: number;
  repeat: boolean;
  continuous: boolean;
  /**是否发送整篇（包括表头） */
  whole: boolean;
  loading?: boolean;
  onSubmit: (repeat: boolean, index: number, page: number, count: number) => void;
  onCancel: () => void;
  type?: string;
}

const McSendModal: FC<IProps> = ({
  title,
  visible,
  role = "body",
  page = 1,
  size = 1,
  dx = 0,
  dy = 0,
  repeat = false,
  continuous = false,
  whole = false,
  onSubmit,
  onCancel,
  loading = false,
  type,
}) => {
  const [totalPage, setTotalPage] = useState(0);
  const [pausePage, setPausePage] = useState(totalPage - page);
  const [resend, setResend] = useState(repeat);
  const [tips, setTips] = useState("");

  //计算页数
  useEffect(() => {
    const tp = Math.ceil(size / 100);
    setTotalPage(tp);
  }, [setTotalPage, size]);

  //组织提示内容
  useEffect(() => {
    const x = dx < 0 ? 0 : dx;
    const y = dy < 0 ? 0 : dy;
    const px = position(x);
    const py = position(y);
    const text = whole
      ? "开始发报"
      : role === "head"
      ? "重发完整报头？"
      : x === y
      ? continuous
        ? `从${px}开始发送？`
        : `发送 ${py} ?`
      : `发送 ${px} 到 ${py} ?`;
    setTips(text);
  }, [setTips, role, dx, dy, continuous, whole]);

  const footer = (
    <div className="footer-btns">
      <McButton key="back" onClick={onCancel}>
        取消
      </McButton>
      <McButton
        key="submit"
        icon="send"
        type="primary"
        onClick={() => {
          whole
            ? onSubmit(false, 0, 0, pausePage + 1)
            : role === "body"
            ? onSubmit(resend, dx, page, pausePage + 1)
            : onSubmit(resend, 0, 0, 0);
        }}
      >
        发送
      </McButton>
    </div>
  );
  return (
    <McModalNice
      width={672}
      okText="发送"
      title={title}
      visible={visible}
      footer={footer}
      onCancel={onCancel}
      className="mc-tx-send-modal"
      confirmLoading={loading}
      maskClosable={false}
      centered={true}
    >
      <div className="mc-tx-send-modal__hint">{tips}</div>
      <Form layout="vertical">
        {!whole && (
          // <Form.Item required label="是否重新发送">
          <Form.Item required label="选择发送类型">
            <Radio.Group value={resend} onChange={event => setResend(event.target.value)}>
              <Radio value={false}>正常发送(MSG GA)</Radio>
              <Radio value={true}>重新发送(RPT)</Radio>
            </Radio.Group>
          </Form.Item>
        )}
        {((totalPage > 1 && dx === dy && dx % 100 === 0 && !resend) || whole) && (
          <Form.Item
            required
            label={
              type === "EX"
                ? ""
                : totalPage === 1
                ? ""
                : "您可以选择发送几页后暂停，然后点击后续一页的第一格继续发送"
            }
          >
            <Radio.Group value={pausePage} onChange={event => setPausePage(event.target.value)}>
              {totalPage - page >= 1 && <Radio value={0}>1页</Radio>}
              {totalPage - page >= 2 && <Radio value={1}>2页</Radio>}
              {totalPage - page >= 3 && <Radio value={2}>3页</Radio>}
              {totalPage - page >= 5 && <Radio value={4}>5页</Radio>}
              {totalPage - page >= 10 && <Radio value={9}>10页</Radio>}
              {totalPage - page >= 20 && <Radio value={19}>20页</Radio>}
              {totalPage - page >= 30 && <Radio value={29}>30页</Radio>}
              {totalPage - page >= 50 && <Radio value={49}>50页</Radio>}
              {totalPage - page >= 100 && <Radio value={99}>100页</Radio>}
              {totalPage - page >= 200 && <Radio value={199}>200页</Radio>}
              {totalPage - page >= 300 && <Radio value={299}>300页</Radio>}
              {totalPage - page >= 500 && <Radio value={499}>500页</Radio>}
              {totalPage - page >= 1000 && <Radio value={999}>1000页</Radio>}
              <Radio value={totalPage - page}>不暂停发送到结束({totalPage - page + 1}页)</Radio>
            </Radio.Group>
          </Form.Item>
        )}
      </Form>
    </McModalNice>
  );
};

export default McSendModal;

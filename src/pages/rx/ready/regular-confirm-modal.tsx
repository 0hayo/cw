import "./index.less";
import React, { FC, useState } from "react";
import McButton from "components/mc-button";
import { Form, Radio } from "antd";
import McModalNice from "components/mc-modal-nice";

interface IProps {
  visible: boolean;
  onCancel: VoidFunction;
  onCover: VoidFunction;
  onMerge: VoidFunction;
  onKeep: VoidFunction;
}

const McRegularModal: FC<IProps> = ({ visible, onCancel, onMerge, onCover, onKeep, children }) => {
  const [mode, setMode] = useState("merge");

  const footer = (
    <div>
      <McButton key="back" onClick={onCancel}>
        取消
      </McButton>
      <McButton
        key="submit"
        icon="check"
        type="primary"
        onClick={mode === "merge" ? onMerge : mode === "cover" ? onCover : onKeep}
      >
        确定
      </McButton>
    </div>
  );
  return (
    <McModalNice
      width={672}
      title=""
      visible={visible}
      footer={footer}
      onCancel={onCancel}
      className="mc-rx-regular-modal"
      centered={true}
    >
      <div className="mc-rx-regular-modal__hint">
        <h2>检测到已存在的整报结果，您可以选择：</h2>
        <Form layout="vertical">
          <Form.Item required label="">
            <Radio.Group value={mode} onChange={event => setMode(event.target.value)}>
              <Radio value="merge">智能合并:</Radio>
              <p>
                将当前报文和已有整报结果进行合并，之前修正过的报文将会保留，如有新增的报文将会附加到之前整报结果之后。
              </p>
              <Radio value="cover">重新整报:</Radio>
              <p>使用新收到的报文重新进行整报，之前的整报结果将被丢弃。请谨慎操作。</p>
              <Radio value="keep">保留已有整报结果:</Radio>
              <p>保留之前的整报结果，如果有新收到的电文将被忽略。</p>
            </Radio.Group>
          </Form.Item>
        </Form>
      </div>
    </McModalNice>
  );
};

export default McRegularModal;

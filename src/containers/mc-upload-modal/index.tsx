import { focus } from "misc/dom";
import { Form, Input } from "antd";
import message from "misc/message";
import useGuid from "hooks/useGuid";
import useState from "hooks/useState";
import Modal from "components/mc-modal";
import React, { FC, useEffect } from "react";

interface IProps {
  visible: boolean;
  onCancel: VoidFunction;
  onSubmit: (name: string) => void;
}

const McUploadModal: FC<IProps> = props => {
  const guid = useGuid();
  const [name, setName] = useState("");

  useEffect(() => {
    setName("");
    // 获取光标
    if (props.visible) {
      window.setTimeout(() => focus(`mc-${guid}`), 0);
    }
  }, [guid, props.visible]);

  return (
    <Modal
      width={400}
      title="导入文件"
      okText="开始导入"
      visible={props.visible}
      onCancel={props.onCancel}
      className="mc-upload-modal"
      onOk={() => {
        if (name.length === 0) {
          message.failure("请输入：文件标题");
          return;
        }
        props.onSubmit(name);
      }}
    >
      <Form layout="vertical">
        <Form.Item required label="文件标题 (必填)">
          <Input
            id={`mc-${guid}`}
            value={name}
            maxLength={30}
            placeholder="请输入"
            onChange={event =>
              setName(event.currentTarget.value.replace(/\s/g, ""))
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default McUploadModal;

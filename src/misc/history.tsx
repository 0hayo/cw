import { Modal } from "antd";
import { createHashHistory } from "history";

const history = createHashHistory({
  getUserConfirmation: (message, callback) => {
    Modal.confirm({
      centered: true,
      maskClosable: false,
      title: message,
      okType: "danger",
      onOk: () => callback(true),
      onCancel: () => callback(false),
    });
  },
});
export default history;

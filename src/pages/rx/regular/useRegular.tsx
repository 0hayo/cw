import { setter } from "../typing";
import { useCallback } from "react";
import { each } from "misc/telegram";
import { Modal } from "antd";
import useWarn from "../useWarn";

const useRegular = (
  setForm: setter
): {
  smart: () => void;
} => {
  const markWarn = useWarn(setForm);

  const smart = useCallback(() => {
    Modal.confirm({
      centered: true,
      maskClosable: false,
      title: "智能整报",
      content: "智能整报将会自动处理改错符，并进行智能分组，是否继续？",
      okText: "一键智能整报",
      cancelText: "取消",
      onOk: () => {
        setForm(form => {
          each(form.regular.head, (k, v) => {
            const correctIdx = v.value.lastIndexOf("?");
            if (correctIdx >= 0) {
              v.value = v.value.substring(correctIdx);
            }
          });
          each(form.regular.body, (k, v) => {
            const correctIdx = v.value.lastIndexOf("?");
            if (correctIdx >= 0) {
              v.value = v.value.substring(correctIdx + 1);
            }
          });
          markWarn(form.regular.head, form.regular.body);
          return {
            ...form,
            // regular: {
            //   ...form.regular,
            // },
          };
        });
      },
    });
  }, [setForm, markWarn]);

  return {
    smart,
  };
};

export default useRegular;

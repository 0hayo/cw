// import { Socket } from "net";
import { setter } from "../typing";
// import exec from "services/exec";
// import message from "misc/message";
// import useMounted from "hooks/useMounted";
// import { useCallback, MutableRefObject } from "react";
import { useCallback } from "react";
import { cloneDeep } from "lodash";
import { each } from "misc/telegram";
import useWarn from "../useWarn";

const useRegular = (
  setForm: setter
): {
  cover: () => void;
  merge: () => void;
  goto: () => void;
} => {
  const markWarn = useWarn(setForm);
  const cover = useCallback(() => {
    setForm(form => {
      const head = cloneDeep(form.head);
      const body = cloneDeep(form.body);
      console.log("body=", body);
      markWarn(head, body);
      return {
        ...form,
        regular: {
          ...form.regular,
          body,
          head,
          page: form.page,
          size: form.size,
        },
        scene: "regular",
        ui: {
          ...form.ui,
          warn: true,
        },
      };
    });
    // eslint-disable-next-line
  }, [setForm]);

  const merge = useCallback(() => {
    setForm(form => {
      each(form.head, (k, v) => {
        if (!form.regular.head[k] || form.regular.head[k]?.value.trim() === "") {
          //如果相应位置没有整报内容，则进行填充
          form.regular.head[k] = v;
        } else if (
          form.regular.head[k]?.crude === form.regular.head[k]?.value &&
          form.regular.head[k]?.value !== v.value
        ) {
          //对于没有修改过，且新的内容和之前不一致的电文，进行替换
          form.regular.head[k] = v;
        }
      });
      each(form.body, (k, v) => {
        if (!form.regular.body[k] || form.regular.body[k]?.value.trim() === "") {
          //如果相应位置没有整报内容，则进行填充
          form.regular.body[k] = v;
        } else if (
          form.regular.body[k]?.crude === form.regular.body[k]?.value &&
          form.regular.body[k]?.value !== v.value
        ) {
          //对于没有修改过，且新的内容和之前不一致的电文，进行替换
          form.regular.body[k] = v;
        }
      });

      return {
        ...form,
      };
    });
  }, [setForm]);

  const goto = useCallback(() => {
    setForm(form => {
      console.log("form=", form);
      return {
        ...form,
        scene: "regular",
      };
    });
  }, [setForm]);

  return {
    cover,
    merge,
    goto,
  };
};

export default useRegular;

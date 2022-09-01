import { IForm } from "./typing";
import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { max, size } from "misc/telegram";
import { isEmpty } from "lodash";
import moment from "moment";
import message from "misc/message";

const regexp = /^\d{4}$/;

const useCheck = (form: IForm, setForm: Dispatch<SetStateAction<IForm>>): (() => boolean) => {
  const checkBody = useCallback(
    (jump: boolean = false) => {
      if (form.type === "EX") return true; //EX报文不检查报文正文格式
      const body = form.body;
      let result = true;
      let errIdx = "";
      const len = max(body);
      let hasEmpty = false;
      for (var i = 0; i < len; i++) {
        const k = i + "";
        const v = body[k];
        if (!v) {
          result = false;
          errIdx = errIdx ? errIdx : k;
          hasEmpty = true;
        } else if (isEmpty(v.value) || !regexp.test(v.value) || (v.value as string).length !== 4) {
          v.warn = true;
          result = false;
          errIdx = errIdx ? errIdx : k;
        } else {
          v.warn = false;
        }
      }

      if (hasEmpty) {
        message.destroy();
        message.failure("报文内容错误", "存在内容为空的报文组，请检查！", false, 3);
      }

      // each(body, (k, v) => {
      //   if (isEmpty(v.value) || v.value === "" || !regexp.test(v.value) || (v.value as string).length !== 4) {
      //     v.warn = true;
      //     result = false;
      //     errIdx = errIdx ? errIdx : k;
      //   } else {
      //     v.warn = false;
      //   }
      // });
      if (jump && errIdx) {
        const idxNum = parseInt(errIdx);
        const page = Math.ceil(idxNum / 100);
        setForm(x => ({ ...x, page: page }));
      }
      return result;
    },
    [form.body, form.type, setForm]
  );

  useEffect(() => {
    let warn = !checkBody(false);
    setForm(x => ({
      ...x,
      warn,
    }));
  }, [form.type, form.head, form.body, checkBody, setForm]);

  const check = useCallback(() => {
    let result = true;
    if (!form.type) {
      message.failure("请选择报文类型");
      result = false;
    }

    if (!form.head["NR"]) {
      setForm(x => ({
        ...x,
        head: { ...x.head, NR: { ...x.head["NR"], warn: true } },
      }));
      message.failure("缺少报头内容", "请输入报头“号数”");
      result = false;
    } else if (form.type === "EX") {
      //EX报文的NR必须以“/EX“结尾
      if (!form.head["NR"].value.endsWith("/EX")) {
        message.failure("报头错误", "EX报头“号数”必须以“/EX“结尾");
        result = false;
      }
    }

    if (form.head["CK"]?.value) {
      if (checkBody(true)) {
        const ck = parseInt(form.head["CK"].value);
        const actualSize = size(form.body);
        if (ck !== actualSize) {
          setForm(x => ({
            ...x,
            head: { ...x.head, CK: { ...x.head["CK"], warn: true } },
          }));
          message.failure("报头内容错误", "报头“组数”和实际报文组数不一致");
          result = false;
        }
      } else {
        message.failure("报文内容错误", "报文内容存在错误，请检查");
        result = false;
      }
    } else {
      message.failure("缺少报头内容", "请输入组数");
      result = false;
    }

    if (form.head["DATE"]?.value) {
      const dateStr = form.head["DATE"].value;
      const check = moment(dateStr, "MMDD").isValid();
      if (!check || dateStr.length !== 4) {
        setForm(x => ({
          ...x,
          head: { ...x.head, DATE: { ...x.head["DATE"], warn: true } },
        }));
        message.failure("报头格式错误", "报头“月日”格式错误，无效的日期");
        result = false;
      }
    } else {
      message.failure("缺少报头内容", "请输入月日");
      result = false;
    }

    if (form.head["TIME"]?.value) {
      const dateStr = form.head["TIME"].value;
      const check = moment(dateStr, "HHmm").isValid();
      if (!check || dateStr.length !== 4) {
        setForm(x => ({
          ...x,
          head: { ...x.head, TIME: { ...x.head["TIME"], warn: true } },
        }));
        message.failure("报头格式错误", "报头“时分”格式错误，无效的时间");
        result = false;
      }
    } else {
      message.failure("缺少报头内容", "请输入时分");
      result = false;
    }

    if (!checkBody(true)) {
      message.failure("报文内容错误", "报文内容存在错误，请检查");
      result = false;
    }

    return result;
  }, [form, checkBody, setForm]);

  return check;
};

export default useCheck;

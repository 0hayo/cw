import McRxReady from "./ready";
import useForm from "./useForm";
import useInit from "./useInit";
import useChat from "./useChat";
import React, { FC } from "react";
import withTabbar from "hoc/withTabbar";
import McRxRegular from "./regular";
import cwIForm from "pages/cw/form";

const McRxPage: FC<{ cwForm?: cwIForm; setCwForm: (x) => void }> = ({ cwForm, setCwForm }) => {
  const [form, setForm] = useForm();

  useChat(setForm);
  useInit(setForm);

  return (
    <>
      {(() => {
        if (form.scene === "regular") {
          // alert("regular");
          return (
            <McRxRegular form={form} setForm={setForm} cwForm={cwForm} setCwForm={setCwForm} />
          );
        } else if (form.scene === "ready") {
          return <McRxReady form={form} setForm={setForm} cwForm={cwForm} setCwForm={setCwForm} />;
        }
      })()}
      {/*<Prompt*/}
      {/*  message={next => {*/}
      {/*    const search = qs.parse(next.search);*/}
      {/*    if (form.leave) {*/}
      {/*      return true;*/}
      {/*    }*/}
      {/*    if (isEmpty(search.silent)) {*/}
      {/*      return "离开当前页面？";*/}
      {/*    }*/}
      {/*    return true;*/}
      {/*  }}*/}
      {/*/>*/}
    </>
  );
};

export default withTabbar(McRxPage)("rx");

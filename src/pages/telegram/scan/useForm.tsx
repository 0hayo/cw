import { IForm } from "./typing";
import { Dispatch, SetStateAction } from "react";
import useState, { Setter } from "hooks/useState";

const useForm = (
  type: TelegramBizType
): [IForm, Dispatch<SetStateAction<IForm>>, Setter<keyof IForm>] => {
  const [form, setForm, setFormValue] = useState<IForm>({
    telegramUuid: "",
    page: 1,
    size: 0,
    name: "",
    date: new Date().toISOString(),
    type: type,
    modal: false,
    head: {},
    body: {},
    images: [],
    imgdir: "",
    sysFilesId: "",
    saved: true,
    role: "head",
    offset: 0,
    active: -1,
    mode: undefined,
  });

  return [form, setForm, setFormValue];
};

export default useForm;

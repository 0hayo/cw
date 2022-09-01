import { IForm } from "./typing";
import { Dispatch, SetStateAction } from "react";
import useState, { Setter } from "hooks/useState";

const useForm = (): [IForm, Dispatch<SetStateAction<IForm>>, Setter<keyof IForm>] => {
  const [form, setForm, setFormValue] = useState<IForm>({
    page: 1,
    size: 0,
    name: "",
    date: new Date().toISOString(),
    type: "CW",
    role: "body",
    offset: 0,
    head: {},
    body: {},
    modal: false,
    modalTask: false,
    saved: true,
    warn: false,
    active: -1,
    datagramType: "CW",
  });

  // useEffect(() => {
  //   setForm(it => ({
  //     ...it,
  //     // saved: false,
  //   }));
  // }, [form.body, form.head, setForm]);

  return [form, setForm, setFormValue];
};

export default useForm;

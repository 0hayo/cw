import { IForm } from "./typing";
import { Dispatch, SetStateAction } from "react";
import useState, { Setter } from "hooks/useState";

const useForm = (
  role: "head" | "body",
  offset: number
): [IForm, Dispatch<SetStateAction<IForm>>, Setter<keyof IForm>] => {
  const [form, setForm, setProp] = useState<IForm>({
    role,
    offset,
    auto: false,
    active: 0,
  });

  return [form, setForm, setProp];
};

export default useForm;

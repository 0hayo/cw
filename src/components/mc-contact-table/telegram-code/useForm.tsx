import useState, { Setter } from "hooks/useState";
import { Dispatch, SetStateAction } from "react";
import { ITelegramCodeForm } from "./form";

const useForm = (): [
  ITelegramCodeForm,
  Dispatch<SetStateAction<ITelegramCodeForm>>,
  Setter<keyof ITelegramCodeForm>
] => {
  const [form, setForm, setFormValue] = useState<ITelegramCodeForm>({
    telegramCodes: [],
    add: false,
    reload: false,
  });

  return [form, setForm, setFormValue];
};

export default useForm;

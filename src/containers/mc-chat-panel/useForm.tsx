import { useState, Dispatch, SetStateAction } from "react";

interface IForm {
  uuid: string;
  modal: boolean;
}

const useForm = (): [IForm, Dispatch<SetStateAction<IForm>>] => {
  const [form, setForm] = useState<IForm>({
    uuid: "",
    modal: false,
  });

  return [form, setForm];
};

export default useForm;

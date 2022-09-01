import useState, { Setter } from "hooks/useState";
import { Dispatch, SetStateAction } from "react";

const useForm = (): [
  IContactTableSettingForm,
  Dispatch<SetStateAction<IContactTableSettingForm>>,
  Setter<keyof IContactTableSettingForm>
] => {
  const [form, setForm, setFormValue] = useState<IContactTableSettingForm>({
    contactTables: [],
    activeContactTable: null,
    add: false,
    reload: false,
  });

  return [form, setForm, setFormValue];
};

export default useForm;

import { IForm } from "./typing";
import { Dispatch, SetStateAction } from "react";
import useState, { Setter } from "hooks/useState";

const useForm = (type: string): [IForm, Dispatch<SetStateAction<IForm>>, Setter<keyof IForm>] => {
  const [form, setForm, setProp] = useState<IForm>({
    keyword: "",
    folders: [],
    loading: false,
    sortord: "stime",
    radioUuid: undefined,
    checked: [],
    type: type,
    page: 1,
    pageSize: 40,
    totalNum: 0,
    totalPage: 1,
  });

  return [form, setForm, setProp];
};

export default useForm;

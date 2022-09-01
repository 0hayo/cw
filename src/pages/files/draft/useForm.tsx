import { IForm } from "./typing";
import { Dispatch, SetStateAction } from "react";
import useState, { Setter } from "hooks/useState";

const useForm = (): [IForm, Dispatch<SetStateAction<IForm>>, Setter<keyof IForm>] => {
  const [form, setForm, setProp] = useState<IForm>({
    radioUuid: undefined,
    keyword: "",
    folders: [],
    checked: [],
    loading: false,
    sortord: "stime",
    page: 1,
    pageSize: 50,
    totalNum: 0,
    totalPage: 1,
  });

  return [form, setForm, setProp];
};

export default useForm;

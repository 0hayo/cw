import { useEffect, Dispatch, SetStateAction, useContext } from "react";
import IForm from "./form";
import MstContext from "containers/mst-context/context";

const useInit = async (setForm: Dispatch<SetStateAction<IForm>>) => {
  const { localStation } = useContext(MstContext);
  useEffect(() => {
    setForm(x => ({
      ...x,
      station: localStation,
    }));
  }, [localStation, setForm]);
};

export default useInit;

import { McDocxData } from "./typing";
import { useCallback, Dispatch, SetStateAction } from "react";

const useDrop = (setter: Dispatch<SetStateAction<McDocxData>>) =>
  useCallback(
    (doc: IScanImage) => {
      setter(it => {
        const docs = it.docs.filter(it => it !== doc);
        return {
          ...it,
          docs,
          active: Math.max(0, Math.min(it.active, docs.length - 1)),
        };
      });
    },
    [setter]
  );

export default useDrop;

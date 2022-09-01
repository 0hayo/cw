import { IForm } from "./typing";
import { useCallback, Dispatch, SetStateAction } from "react";

const kRegex = /^\d+P\d+W$/;
const useCheck = (
  setForm: Dispatch<SetStateAction<IForm>>
): {
  handlePrev: VoidFunction;
  handleNext: VoidFunction;
  handleActive: (index: number) => void;
  handleLocate: (value: string) => void;
} => {
  const handlePrev = useCallback(() => {
    setForm(it => ({
      ...it,
      offset: Math.max(0, it.offset - 1),
    }));
  }, [setForm]);

  const handleNext = useCallback(() => {
    setForm(it => ({
      ...it,
      offset: it.offset + 1,
    }));
  }, [setForm]);

  const handleActive = useCallback(
    (index: number) => {
      setForm(it => ({
        ...it,
        active: index,
      }));
    },
    [setForm]
  );

  const handleLocate = useCallback(
    (value: string) => {
      setForm(it => {
        if (value === "PTR") {
          return {
            ...it,
            offset: 0,
            active: 0,
            role: "head",
          };
        }

        if (kRegex.test(value)) {
          const pair = value.split("P");
          const page = parseInt(pair[0]);
          const word = parseInt(pair[1]);
          const offset = page * 100 - 100 + word - 1;

          if (offset >= 0) {
            return {
              ...it,
              offset,
              active: 0,
              role: "body",
            };
          }
        }
        return it;
      });
    },
    [setForm]
  );

  return {
    handlePrev,
    handleNext,
    handleActive,
    handleLocate,
  };
};

export default useCheck;

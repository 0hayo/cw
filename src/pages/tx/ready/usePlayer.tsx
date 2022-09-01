import { IForm } from "./typing";
import { Dispatch, useCallback, SetStateAction } from "react";

const usePlayer = (
  setForm: Dispatch<SetStateAction<IForm>>
): {
  onPlay: (offset: number) => void;
  onStop: () => void;
} => {
  const onPlay = useCallback(
    async (offset: number) => {
      if (isNaN(offset)) return;
      setForm(form => {
        const page = Math.ceil((offset + 1) / 100);
        return {
          ...form,
          check: {
            ...form.check,
            role: "body",
            active: offset,
            page: page,
            offset: offset,
          },
        };
      });
    },
    [setForm]
  );

  const onStop = useCallback(async () => {
    // setForm(form => {
    //   return {
    //       ...form,
    //       active: -1,
    //   };
    // });
  }, []);

  return { onPlay, onStop };
};

export default usePlayer;

import { IForm } from "../typing";
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
          regular: {
            ...form.regular,
            role: "body",
            active: offset,
            offset: offset,
            page: page,
          },
        };
      });
    },
    [setForm]
  );

  const onStop = useCallback(async () => {
    setForm(form => {
      return {
        ...form,
        regular: {
          ...form.regular,
          role: "body",
          active: 0,
          offset: -1,
        },
      };
    });
  }, [setForm]);

  return { onPlay, onStop };
};

export default usePlayer;

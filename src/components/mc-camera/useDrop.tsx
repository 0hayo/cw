import { McCameraData } from "./typing";
import { useCallback, Dispatch, SetStateAction } from "react";

const useDrop = (
  setter: Dispatch<SetStateAction<McCameraData>>,
  onDrop?: (image: IScanImage) => void
) =>
  useCallback(
    (image: IScanImage) => {
      setter(it => {
        onDrop && onDrop(image);
        const images = it.images.filter(it => it !== image);
        return {
          ...it,
          images,
          mode: images.length ? "photo" : "video",
          active: Math.max(0, Math.min(it.active, images.length - 1)),
        };
      });
    },
    [setter, onDrop]
  );

export default useDrop;

import { useEffect, useState } from "react";

/**
 * 参照指定容器的高度，动态返回一个高度
 * */
const useAutoHeight = (
  /** 参照容器的id */
  containerElementId: string,
  /** 偏移量（会在容器高度上减去此偏移量） */
  offset: number = 0
): number => {
  const [height, setHeight] = useState(offset);

  useEffect(() => {
    const el = document.getElementById(containerElementId);
    if (el) {
      setHeight(el.clientHeight - offset);
    }
  }, [containerElementId, offset]);

  return height;
};

export default useAutoHeight;

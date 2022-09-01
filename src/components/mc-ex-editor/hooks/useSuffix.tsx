import { MceRange } from "mce/typing";
import { useState, useEffect } from "react";

interface IMenu {
  x: number;
  y: number;
  w: number;
  h: number;
}

const kWidth = 48;
const kInit = { x: -10000, y: -10000, w: 0, h: 0 };
const useSuffix = (uuid: string, range: MceRange, role: "head" | "body"): IMenu => {
  const { dx, dy } = range;
  const [suffix, setSuffix] = useState(kInit);

  useEffect(() => {
    const cells = document.body.querySelectorAll(
      `#mc-${uuid} .mc-ex-editor-${role} .mc-ex-editor__cell`
    );
    const dom = document.getElementById(`mc-${uuid}`);
    const max = cells[dy % 100] as HTMLDivElement;

    setSuffix(() => {
      if (dom && max && role === range.role && range.menu) {
        const r1 = dom.getBoundingClientRect();
        const r2 = max.getBoundingClientRect();

        let x = r2.right + kWidth > r1.right ? r1.width - kWidth : r2.right - r1.left;
        let y = r2.top - r1.top;

        return {
          x,
          y,
          w: kWidth,
          h: r2.height,
        };
      }

      return kInit;
    });
  }, [uuid, dx, dy, role, range.role, range.menu]);

  return suffix;
};

export default useSuffix;

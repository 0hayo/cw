import { MceRange } from "mce/typing";
import { useState, useEffect } from "react";

interface IMenu {
  x: number;
  y: number;
  w: number;
  h: number;
  cw: number;
}

const KHeight = 32;
const OFFSET_Y = 130;
const kInit = { x: -10000, y: -10000, w: 0, h: 0, cw: 0 };
const useSuffix = (uuid: string, range: MceRange, role: "head" | "body"): IMenu => {
  const { dx, dy } = range;
  const [suffix, setSuffix] = useState(kInit);

  useEffect(() => {
    const cells = document.body.querySelectorAll(`#mc-${uuid} .mc-editor-${role} .mc-editor__cell`);
    const dom = document.getElementById(`mc-${uuid}`);
    const max = cells[dy % 100] as HTMLDivElement;

    setSuffix(() => {
      if (dom && max && dx !== dy && role === range.role && range.menu) {
        const r1 = dom.getBoundingClientRect();
        const r2 = max.getBoundingClientRect();

        // let x =
        //   r2.right > r1.right ? r1.width : r2.right - r1.left;
        let x = r2.left - r1.left + 8;
        let y = r2.top - r1.top - OFFSET_Y;

        return {
          x,
          y,
          w: r2.width + 80,
          h: KHeight,
          cw: r2.width,
        };
      }

      return kInit;
    });
  }, [uuid, dx, dy, role, range.role, range.menu]);

  return suffix;
};

export default useSuffix;

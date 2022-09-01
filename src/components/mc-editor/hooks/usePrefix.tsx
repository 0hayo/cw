import { MceRange } from "mce/typing";
import { useState, useEffect } from "react";

interface IMenu {
  x: number;
  y: number;
  w: number;
  h: number;
  cw: number; //client width
  input?: HTMLInputElement;
}

const kWidth = 180;
const KHeight = 32;
const OFFSET_Y = 130;
const kInit = { x: -10000, y: -10000, w: 0, h: 0, cw: 0 };
const usePrefix = (uuid: string, range: MceRange, role: "head" | "body"): IMenu => {
  const { dx, dy } = range;
  const [prefix, setPrefix] = useState(kInit);

  useEffect(() => {
    const cells = document.body.querySelectorAll(`#mc-${uuid} .mc-editor-${role} .mc-editor__cell`);
    const dom = document.getElementById(`mc-${uuid}`);
    const min = cells[dx % 100] as HTMLDivElement;
    const currInput = document.getElementById(`mc-${uuid}--body--${dx}`) as HTMLInputElement;

    setPrefix(() => {
      if (dom && min && dx === dy && role === range.role && range.menu) {
        const r1 = dom.getBoundingClientRect();
        const r2 = min.getBoundingClientRect();

        // let x = dx % 10 === 0 ? 0 : r2.left - r1.left - kWidth;
        let x = r2.left - r1.left + 8;
        let y = r2.top - r1.top - OFFSET_Y;
        let w = r2.width + 80;

        if (role === "head") {
          y = r2.top - r1.top + r2.height;
          w = kWidth;
          x = r2.left - r1.left + 8;
        }

        return {
          x,
          y,
          w: w,
          h: KHeight,
          cw: r2.width,
          input: currInput,
        };
      }

      return kInit;
    });
  }, [uuid, dx, dy, role, range.role, range.menu]);

  return prefix;
};

export default usePrefix;

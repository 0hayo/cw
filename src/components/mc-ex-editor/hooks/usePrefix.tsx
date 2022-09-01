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
const usePrefix = (uuid: string, range: MceRange, role: "head" | "body"): IMenu => {
  const { dx, dy } = range;
  const [prefix, setPrefix] = useState(kInit);

  useEffect(() => {
    const cells = document.body.querySelectorAll(
      `#mc-${uuid} .mc-ex-editor-${role} .mc-ex-editor__cell`
    );
    const dom = document.getElementById(`mc-${uuid}`);
    const min = cells[dx % 100] as HTMLDivElement;

    setPrefix(() => {
      if (dom && min && dx === dy && role === range.role && range.menu) {
        const r1 = dom.getBoundingClientRect();
        const r2 = min.getBoundingClientRect();

        let x = dx % 10 === 0 ? 0 : r2.left - r1.left - kWidth;
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

  return prefix;
};

export default usePrefix;

import { Bus } from "misc/bus";
import { MceRange } from "mce/typing";
import { useState, useEffect } from "react";

interface IProps {
  bus: Bus;
  uuid: string;
}
const kInit: MceRange = { dx: -1, dy: -1, role: "none", menu: false };
const useRange = ({ bus, uuid }: IProps): MceRange => {
  const [range, setRange] = useState(kInit);

  useEffect(() => {
    bus.on(`mc-${uuid}:head:click`, index => {
      setRange({
        dx: index,
        dy: index,
        role: "head",
        menu: false,
      });
    });

    bus.on(`mc-${uuid}:body:click`, index => {
      setRange({
        dx: index,
        dy: index,
        role: "body",
        menu: false,
      });
    });

    bus.on(`mc-${uuid}:head:contextMenu`, index => {
      setRange({
        dx: index,
        dy: index,
        role: "head",
        menu: true,
      });
    });

    bus.on(`mc-${uuid}:body:contextMenu`, index => {
      setRange({
        dx: index,
        dy: index,
        role: "body",
        menu: true,
      });
    });

    bus.on(`mc-${uuid}:body:shift+click`, index => {
      setRange(it => {
        return {
          dx: Math.min(it.dx, it.dy, index),
          dy: Math.max(it.dx, it.dy, index),
          role: "body",
          menu: true,
        };
      });
    });

    // bus.on(`mc-${uuid}:body:blur`, () => {
    //   setRange({
    //     dx: -1,
    //     dy: -1,
    //     role: "body",
    //   });
    // });

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const editor = document.getElementById(`mc-${uuid}`);
      if (editor && target && editor.contains(target)) {
        return;
      }
      setRange(kInit);
    };

    document.body.addEventListener("click", handleClick);
    return () => document.body.removeEventListener("click", handleClick);
  }, [bus, uuid]);

  return range;
};

export default useRange;

import make, { Bus } from "misc/bus";
import { createContext } from "react";
import { MceRange } from "mce/typing";

export interface MceContextProps {
  bus: Bus;
  uuid: string;
  range: MceRange;
  readonly: boolean;
}

const McEditorContext = createContext<MceContextProps>({
  bus: make(),
  uuid: "none",
  range: {
    dx: -1,
    dy: -1,
    role: "none",
    menu: false,
  },
  readonly: false,
});

export default McEditorContext;

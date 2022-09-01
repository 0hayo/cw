import { MceRange } from "mce/typing";
import make, { Bus } from "misc/bus";
import { createContext } from "react";

export interface McEditorContextProps {
  bus: Bus;
  uuid: string;
  range: MceRange;
  readonly: boolean;
}

const McEditorContext = createContext<McEditorContextProps>({
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

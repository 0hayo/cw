import McEdit from "./edit";
import McRead from "./read";
import { MceFlag } from "mce/typing";
import McEditorContext from "./context";
import React, { FC, useContext } from "react";

interface IProps {
  max: number;
  flag: MceFlag;
  index: number;
  field: string;
  hash: McTelegramHash;
  role: "head" | "body";
  maxLength?: number;
  allowSpace?: boolean;
  autoFocus?: boolean;
  direction: "rx" | "tx";
  highlighting: boolean;
  image?: boolean;
}

const McEditorCell: FC<IProps> = props => {
  const { readonly } = useContext(McEditorContext);
  return readonly ? <McRead {...props} /> : <McEdit {...props} />;
};

export default McEditorCell;

import { MceFlag } from "mce/typing";
import McEdit from "./edit";
import McRead from "./read";
import McEditorContext from "./context";
import React, { FC, useContext } from "react";

interface IProps {
  index: number;
  field: string;
  flag: MceFlag;
  hash: McTelegramHash;
  role: "head" | "body";
  maxLength?: number;
  allowSpace?: boolean;
}

const McEditorCell: FC<IProps> = props => {
  const { readonly } = useContext(McEditorContext);
  return readonly ? <McRead {...props} /> : <McEdit {...props} />;
};

export default McEditorCell;

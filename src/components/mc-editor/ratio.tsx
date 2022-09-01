import "./styles/ratio.less";
import React, { FC } from "react";
import classnames from "classnames";

interface IProps {
  value: number[];
}

const McEditorRatio: FC<IProps> = ({ value }) => {
  return (
    <div className="mc-editor-ratio">
      {value.map((it, ix) => (
        <i
          key={ix}
          className={classnames("mc-editor__color", {
            "mc-editor__color-97": it >= 97,
            "mc-editor__color-90": it >= 90 && it < 97,
            "mc-editor__color-80": it >= 80 && it < 90,
            "mc-editor__color-0": it >= 0 && it < 80,
          })}
        />
      ))}
    </div>
  );
};

export default McEditorRatio;

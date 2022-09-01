import React, { FC } from "react";

interface IProps {
  width?: number | string;
  height?: number | string;
}

const SizedBox: FC<IProps> = ({ children, width = 0, height = 0 }) => {
  return (
    <div
      style={{
        width,
        height,
      }}
    >
      {children}
    </div>
  );
};

export default SizedBox;

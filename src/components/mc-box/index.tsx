import React, { FC, CSSProperties } from "react";

interface IProps {
  tag?: string;
  className?: string;
}

const Box: FC<IProps & CSSProperties> = ({
  tag = "div",
  children,
  className,
  ...rest
}) => {
  return React.createElement(
    tag,
    {
      style: rest,
      className,
    },
    children
  );
};

export default Box;

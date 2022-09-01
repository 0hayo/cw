import "./index.less";
import React, { FC, useState, useEffect } from "react";
import McIcon from "components/mc-icon";
import { Button } from "antd";

interface IProps {
  min: number;
  max: number;
  value: number;
  onChange?: (value: number) => void;
}

const McStepper: FC<IProps> = props => {
  const [value, setValue] = useState(props.value);
  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  return (
    <div className="mc-stepper">
      <Button
        type="primary"
        className="mc-stepper__increase"
        onClick={() => {
          const next = value + 1;
          if (next <= props.max) {
            props.onChange && props.onChange(next);
          }
        }}
      >
        <McIcon>plus</McIcon>
      </Button>
      <div className="mc-stepper__value">{value}</div>
      <Button
        type="primary"
        className="mc-stepper__decrease"
        onClick={() => {
          const next = value - 1;
          if (next >= props.min) {
            props.onChange && props.onChange(next);
          }
        }}
      >
        <McIcon>minus</McIcon>
      </Button>
    </div>
  );
};

export default McStepper;

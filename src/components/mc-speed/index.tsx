import "./index.less";
import React, { FC } from "react";
import { Slider } from "antd";

interface IProps {
  value: number;
  disabled?: boolean;
  title?: string;
  onChange: (value: number) => void;
}

const marks = {
  60: "60",
  80: "80",
  100: "100",
  120: "120",
  140: "140",
  160: "160",
  180: "180",
  200: "200",
  // 220: "220",
  // 270: "270",
  // 300: "300",
  // 400: "400",
  // 500: "500",
};

const McSpeed: FC<IProps> = ({ value, disabled = false, title = "码速率", onChange }) => {
  // const [speed, setSpeed] = useState<number>(value);
  return (
    <div className="mc-speed">
      {title && (
        <div style={{ whiteSpace: "nowrap", paddingTop: 0 }}>
          <div>码速率: </div>
          {/* <div>({value})</div> */}
        </div>
      )}
      <Slider
        min={60}
        max={200}
        step={1}
        marks={marks}
        disabled={disabled}
        value={value}
        onChange={value => {
          onChange(value as number);
          // setSpeed(value as number);
        }}
      />
    </div>
  );
};

export default McSpeed;

import "./index.less";
import moment from "moment";
import React, { FC, useEffect, useState } from "react";

const McClock: FC = () => {
  const [date, setDate] = useState(Date.now());

  useEffect(() => {
    const tid = window.setTimeout(() => setDate(Date.now()), 10 * 1000);
    return () => window.clearTimeout(tid);
  }, [date]);

  return (
    <div className="mc-clock-terminal">
      <div className="mc-clock-terminal__date">{moment(date).format("YYYY年MM月DD日")}</div>
      <div className="mc-clock-terminal__time">
        <span>{moment(date).format("ddd")}</span>
        <span>{moment(date).format("HH:mm")}</span>
      </div>
    </div>
  );
};

export default McClock;

import "./index.less";
import moment from "moment";
import React, { FC, useEffect, useState } from "react";

const McClock: FC = () => {
  const [date, setDate] = useState(Date.now());

  useEffect(() => {
    const tid = window.setTimeout(() => setDate(Date.now()), 1 * 1000);
    return () => window.clearTimeout(tid);
  }, [date]);

  return (
    <div className="mc-clock">
      <div className="mc-clock__time">
        <span>{moment(date).format("HH:mm:ss")}</span>
      </div>
      <div className="mc-clock__divider"></div>
      <div className="mc-clock__date">
        <div>{moment(date).format("MM/DD")}</div>
        <div>{moment(date).format("ddd")}</div>
      </div>
    </div>
  );
};

export default McClock;

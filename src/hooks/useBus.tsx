import { useState } from "react";
import make, { Bus } from "misc/bus";

const useBus = (): Bus => {
  const [bus] = useState(make());
  return bus;
};

export default useBus;

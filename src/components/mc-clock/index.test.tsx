import React from "react";
import Clock from "./index";
import moment from "moment";
import { render } from "@testing-library/react";

test("renders app", () => {
  const fmt = moment(Date.now()).format("YYYY年MM月DD日");
  const { getByText } = render(<Clock />);
  const element = getByText(fmt);
  expect(element).toHaveClass("mc-clock__date");
});

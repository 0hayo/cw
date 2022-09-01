import "./less/base.less";
import React from "react";
import ReactDOM from "react-dom";
import McProvider from "containers/mc-provider";
import * as serviceWorker from "./serviceWorker";
import moment from "moment";
import "moment/locale/zh-cn";
import McApp from "containers/mc-app";
import { setAppType } from "misc/env";
setAppType("single");

moment.locale("zh-cn");

ReactDOM.render(
  <McProvider>
    <McApp appType="single" />
  </McProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
serviceWorker.register();

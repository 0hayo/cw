import history from "misc/history";
import Loading from "components/mc-loading";
import React, { FC, Suspense, lazy, useEffect } from "react";
import { Route, Router, Switch, Redirect } from "react-router-dom";
import { Layout } from "antd";
import Header from "containers/mc-header-single";
import { remote } from "electron";
import McMainMenu from "../../components/mc-main-menu/index";

interface IProps {
  showHeaderFooter: boolean;
}

const McRouterSingle: FC<IProps> = ({ showHeaderFooter }) => {
  useEffect(() => {
    const redirectUrl = remote.getGlobal("sharedObject")?.redirectUrl;
    console.log("passed in redirectUrl ===", redirectUrl);
    if (redirectUrl) {
      console.log("jump to page ===", redirectUrl);
      history.push(redirectUrl);
    }
  }, []);

  return (
    <Router history={history}>
      {showHeaderFooter && (
        <Layout.Header className="header">
          <Header>智能收发报系统</Header>
        </Layout.Header>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          height: "100%",
          overflowY: "hidden",
        }}
      >
        <McMainMenu />
        <Suspense fallback={<Loading />}>
          <Switch>
            {/* 首页 */}
            <Route exact path="/home" component={lazy(() => import("pages/home"))} />
            {/* 办报 */}
            <Route exact path="/telegram" component={lazy(() => import("pages/telegram"))} />
            <Route
              exact
              path="/telegram/scan"
              component={lazy(() => import("pages/telegram/scan"))}
            />
            {/* <Route
              exact
              path="/telegram/text"
              component={lazy(() => import("pages/telegram/text"))}
            /> */}
            <Route
              exact
              path="/telegram/input"
              component={lazy(() => import("pages/telegram/input"))}
            />
            {/* 数据中心 */}
            <Route exact path="/statistics" component={lazy(() => import("pages/statistics"))} />
            {/* 文件管理 */}
            <Route
              exact
              path="/files/import"
              component={lazy(() => import("pages/files/import"))}
            />
            <Route exact path="/files/draft" component={lazy(() => import("pages/files/draft"))} />
            <Route exact path="/files/sent" component={lazy(() => import("pages/files/sent"))} />
            <Route exact path="/files/recv" component={lazy(() => import("pages/files/recv"))} />
            {/* 设置 */}
            <Route exact path="/setting" component={lazy(() => import("pages/setting"))} />
            {/* 工作台 */}
            <Route exact path="/workbench" component={lazy(() => import("pages/workbench-7"))} />
            {/* 发报 */}
            <Route exact path="/cw" component={lazy(() => import("pages/cw"))} />
            <Route exact path="/tx" component={lazy(() => import("pages/tx/home"))} />
            <Route
              exact
              path="/tx/show"
              component={lazy(() => import("pages/tx/ready/indexcwShow"))}
            />
            {/*<PrivateRoute exact path="/tx/show" component={lazy(() => import("pages/tx/show"))} />*/}
            {/*<PrivateRoute exact path="/tx/ready" component={lazy(() => import("pages/tx/ready"))} />*/}
            {/* 收报 */}
            <Route exact path="/rx" component={lazy(() => import("pages/rx"))} />
            <Route exact path="/rx/ready" component={lazy(() => import("pages/rx/ready"))} />
            <Route
              exact
              path="/rx/show"
              component={lazy(() => import("pages/rx/regular/indexShow"))}
            />
            {/* 默认跳转到首页 */}
            <Redirect from="/" to="/home" />
            {/* <Redirect from="/home" to="/workbench" /> */}
            {/* <Redirect from="/workbench" to="/home" /> */}
          </Switch>
        </Suspense>
      </div>
    </Router>
  );
};

export default McRouterSingle;

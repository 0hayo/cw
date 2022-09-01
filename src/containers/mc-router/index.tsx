import history from "misc/history";
import Loading from "components/mc-loading";
import React, { FC, Suspense, lazy, useEffect } from "react";
import { Route, Router, Switch, Redirect } from "react-router-dom";
import McBottomMenu from "components/mc-bottom-menu";
import { Layout } from "antd";
import Header from "containers/mc-header";
import { remote } from "electron";
import PrivateRoute from "./private-router";

interface IProps {
  showHeaderFooter: boolean;
}

const McRouter: FC<IProps> = ({ showHeaderFooter }) => {
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
          <Header>短波等幅报智能收发系统</Header>
        </Layout.Header>
      )}
      <Suspense fallback={<Loading />}>
        <Switch>
          {/* 登录 */}
          <Route exact path="/login" component={lazy(() => import("pages/auth/login"))} />
          {/* 首页 */}
          {/* <Route exact path="/home" component={lazy(() => import("pages/home"))} /> */}
          {/* <Route exact path="/home" component={lazy(() => import("pages/workbench"))} /> */}
          {/* 办报 */}
          <PrivateRoute exact path="/telegram" component={lazy(() => import("pages/telegram"))} />
          <PrivateRoute
            exact
            path="/telegram/scan"
            component={lazy(() => import("pages/telegram/scan"))}
          />
          {/* <PrivateRoute
            exact
            path="/telegram/text"
            component={lazy(() => import("pages/telegram/text"))}
          /> */}
          <PrivateRoute
            exact
            path="/telegram/code"
            component={lazy(() => import("pages/telegram/code"))}
          />
          {/* 数据中心 */}
          <PrivateRoute
            exact
            path="/statistics"
            component={lazy(() => import("pages/statistics"))}
          />
          {/* 文件管理 */}
          <PrivateRoute
            exact
            path="/files/import"
            component={lazy(() => import("pages/files/import"))}
          />
          <PrivateRoute
            exact
            path="/files/draft"
            component={lazy(() => import("pages/files/draft"))}
          />
          <PrivateRoute
            exact
            path="/files/sent"
            component={lazy(() => import("pages/files/sent"))}
          />
          <PrivateRoute
            exact
            path="/files/recv"
            component={lazy(() => import("pages/files/recv"))}
          />
          {/* 设置 */}
          <PrivateRoute exact path="/setting" component={lazy(() => import("pages/setting"))} />
          {/* 工作台 */}
          <PrivateRoute exact path="/workbench" component={lazy(() => import("pages/workbench"))} />
          {/* 发报 */}
          <PrivateRoute exact path="/cw" component={lazy(() => import("pages/cw"))} />
          <PrivateRoute exact path="/tx" component={lazy(() => import("pages/tx/home"))} />
          <PrivateRoute
            exact
            path="/tx/show"
            component={lazy(() => import("pages/tx/ready/indexcwShow"))}
          />
          {/* 收报 */}
          <PrivateRoute exact path="/rx" component={lazy(() => import("pages/rx"))} />
          <PrivateRoute exact path="/rx/ready" component={lazy(() => import("pages/rx/ready"))} />
          <PrivateRoute
            exact
            path="/rx/show"
            component={lazy(() => import("pages/rx/regular/indexShow"))}
          />
          {/* 默认跳转到首页 */}
          <Redirect from="/" to="/workbench" />
          <Redirect from="/home" to="/workbench" />
        </Switch>
      </Suspense>
      {showHeaderFooter && <McBottomMenu />}
    </Router>
  );
};

export default McRouter;

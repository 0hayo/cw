import history from "misc/history";
import Loading from "components/mc-loading";
import React, { FC, Suspense, lazy } from "react";
import { Layout } from "antd";
import { Route, Router, Switch, Redirect } from "react-router-dom";
import PrivateRoute from "./private-router";
import Sidebar from "containers/mc-sidebar";

interface IProps {
  showHeaderFooter: boolean;
}

const McRouterTerminal: FC<IProps> = ({ showHeaderFooter }) => {
  return (
    <Router history={history}>
      {showHeaderFooter && (
        <Layout.Sider width="138">
          <Sidebar />
        </Layout.Sider>
      )}
      <Suspense fallback={<Loading />}>
        <Switch>
          {/* 登录(和控制端共用一个页面) */}
          <Route exact path="/login" component={lazy(() => import("pages/auth/login"))} />
          {/* 首页
          // <PrivateRoute exact path="/home" component={lazy(() => import("pages/home"))} /> */}
          {/* 数据中心 */}
          <PrivateRoute
            exact
            path="/statistics"
            component={lazy(() => import("pages/statistics"))}
          />
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
          <PrivateRoute
            exact
            path="/workbench"
            component={lazy(() => import("pages/workbench-terminal"))}
          />
          {/* 设置 */}
          <PrivateRoute exact path="/setting" component={lazy(() => import("pages/setting"))} />

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
    </Router>
  );
};

export default McRouterTerminal;

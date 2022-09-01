import "./index.less";
import React, { FC, useContext, useMemo } from "react";
import UserManagement from "./user/index";
import DeviceManagement from "./device/index";
import ServicePhrase from "./phrase";
import ContactTableManagement from "components/mc-contact-table";
import { useLocation } from "react-router";
import qs from "query-string";
import MstContext from "containers/mst-context/context";
import McLogList from "./log";
import { getAppType } from "misc/env";
import Header from "containers/mc-header-terminal";
import { Layout } from "antd";
import McSysFaultCode from "./fault-code";
import McSysFaultLog from "./fault-log";
import SystemParametersSetting from "./system-param-setting";

const Setting: FC = () => {
  const { appType } = useContext(MstContext);
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const menuIdx = search.id
    ? parseInt(search.id as string)
    : appType === "terminal" || appType === "single"
    ? 3
    : 2;

  // const SETTING_MENUS =
  //   appType === "control"
  //     ? [
  //         { id: 1, name: "终端设备管理", icon: <McIcon>device</McIcon> },
  //         { id: 0, name: "终端用户管理", icon: <UserOutlined /> },
  //         { id: 2, name: "勤务用语编辑", icon: <OrderedListOutlined /> },
  //         { id: 3, name: "联络文件管理", icon: <UserOutlined /> },
  //         { id: 4, name: "系统操作日志", icon: <UserOutlined /> },
  //         { id: 5, name: "系统故障代码表", icon: <UserOutlined /> },
  //         { id: 6, name: "系统故障日志", icon: <UserOutlined /> },
  //       ]
  //     : [
  //         { id: 3, name: "联络文件设置", icon: <DeploymentUnitOutlined /> },
  //         { id: 2, name: "勤务短语设置", icon: <OrderedListOutlined /> },
  //         { id: 7, name: "系统参数设置", icon: <ClusterOutlined /> },
  //       ];

  return (
    <Layout className="mc-setting-page">
      {getAppType() === "terminal" && (
        <Layout.Header>
          <Header>系统设置</Header>
        </Layout.Header>
      )}
      <div className="user">
        {/* <div className="user_title">
          <div className="user_detail">
            <McUser></McUser>
          </div>
          <div className="set_user">修改个人信息</div>
        </div> */}
        {/* 设备管理 */}
        <div className="device">
          {menuIdx === 0 ? (
            // {/* 用户管理 */}
            <UserManagement></UserManagement>
          ) : menuIdx === 1 ? (
            //  {/* 设备管理主体区域 */}
            <DeviceManagement></DeviceManagement>
          ) : menuIdx === 2 ? (
            <ServicePhrase></ServicePhrase>
          ) : menuIdx === 4 ? (
            <McLogList></McLogList>
          ) : menuIdx === 3 ? (
            // 联络文件表管理
            <ContactTableManagement></ContactTableManagement>
          ) : menuIdx === 5 ? (
            // 系统错误代码对照表
            <McSysFaultCode />
          ) : menuIdx === 6 ? (
            // 系统错误代码对照表
            <McSysFaultLog />
          ) : menuIdx === 7 ? (
            // 系统参数设置
            <SystemParametersSetting />
          ) : (
            ""
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Setting;

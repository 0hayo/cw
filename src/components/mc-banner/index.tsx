import "./banner.less";
import React, { FC } from "react";
import Logo from "images/logo/app-logo.png";
import { Modal } from "antd";
import { getAppType } from "misc/env";
import versionControlCenter from "misc/version-control.json";
import versionTerminal from "misc/version-terminal.json";
import versionSingle from "misc/version-single.json";

const McBanner: FC = () => {
  const appType = getAppType();
  const version =
    appType === "control"
      ? versionControlCenter
      : appType === "terminal"
      ? versionTerminal
      : versionSingle;

  return (
    <div className="mc-banner">
      <div className="mc-banner-logo">
        <img src={Logo} alt="LOGO" />
      </div>
      <div
        className="mc-banner-title"
        onClick={() => {
          Modal.info({
            centered: true,
            title: "版本信息",
            content: (
              <div className="version-info">
                <div className="version-item">
                  <div className="version-name">{version.versionName}</div>
                </div>
                <div className="version-item">
                  <div className="version-title">软件版本:</div>
                  <div className="version-content">{version.versionNo}</div>
                </div>
                <div className="version-item">
                  <div className="version-title">提交日期:</div>
                  <div className="version-content">{version.publishDate}</div>
                </div>
                <div className="version-item">
                  <div className="version-title">版本说明:</div>
                  <div className="version-content">{version.updateDesc}</div>
                </div>
              </div>
            ),
          });
        }}
      >
        智能收发报系统
      </div>
    </div>
  );
};

export default McBanner;

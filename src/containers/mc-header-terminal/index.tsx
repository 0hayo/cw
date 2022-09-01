import "./index.less";
import React, { FC, ReactElement, useState } from "react";
import { Button, Col, Modal, Row } from "antd";
import { PoweroffOutlined } from "@ant-design/icons";
import { useHistory } from "react-router";
import McClock from "components/mc-clock-terminal";
import { logout } from "store/actions/auth";
import { useDispatch } from "react-redux";
import fetch from "utils/fetch";
import { LOCAL_MACHINE_ID as radioUuid } from "misc/env";
import McLoading from "components/mc-loading";
import { logInfo } from "../../misc/util";
import store from "store";

interface IProps {
  onBack?: boolean | VoidFunction;
  leading?: ReactElement;
  tailing?: ReactElement;
}

const McHeaderTerminal: FC<IProps> = props => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  return (
    <Row align="middle" className="mc-header-terminal">
      <Col span={9} className="mc-header-terminal__left">
        {props.onBack && (
          <Button
            onClick={() => {
              if (typeof props.onBack === "boolean") {
                history.goBack();
              }
              if (typeof props.onBack === "function") {
                props.onBack();
              }
            }}
            className="btn-back"
          >
            返回
          </Button>
        )}
        <div className="mc-header-terminal__leading">{props.leading}</div>
      </Col>
      <Col span={8}>
        <div className="mc-header-terminal__title">{props.children}</div>
      </Col>
      <Col span={3} className="mc-header-terminal__right">
        <div className="mc-header-terminal__tailing">{props.tailing}</div>
      </Col>
      <Col span={3} className="mc-header-terminal__right">
        <McClock />
      </Col>
      <div
        className="mc-header-terminal__iconBox"
        onClick={() => {
          Modal.confirm({
            title: "退出登录",
            content: "确定要退出登录？",
            centered: true,
            maskClosable: false,
            onOk: () => {
              setLoading(true);
              logInfo("退出登录。");
              const state = store.getState();
              const token = state.auth?.token;
              fetch
                .post(
                  `/user/logout?radioUuid=${radioUuid}`,
                  JSON.stringify({ radioUuid: radioUuid }),
                  {
                    timeout: 5000,
                    headers: {
                      "Content-Type": "application/json",
                      common: {
                        Authorization: `Bearer ${token}`,
                      },
                    },
                  }
                )
                .then(() => {
                  history.push("/login");
                  window.location.reload();
                });
              dispatch(logout());
            },
          });
        }}
      >
        <PoweroffOutlined className="mc-header-terminal__icon" />
      </div>
      {loading && (
        <McLoading position="absolute" top="60%" left="50%" right="50%">
          正在登出系统
        </McLoading>
      )}
    </Row>
  );
};

export default McHeaderTerminal;

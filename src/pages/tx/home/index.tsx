import "./index.less";
import Card from "./card";
import useReady from "./useData";
import React, { FC } from "react";
import Box from "components/mc-box";
import Icon from "components/mc-icon";
import Body from "components/mc-body";
import { Menu, Layout, Button, Dropdown } from "antd";
import Align from "components/mc-align";
import Panel from "components/mc-panel";
import withTabbar from "hoc/withTabbar";
import { useHistory } from "react-router";

const Home: FC = () => {
  const history = useHistory();
  const telegrams = useReady();

  return (
    <Layout className="mc-send-page">
      {/* <Layout.Header>
        <Header>智能发报中心</Header>
      </Layout.Header> */}
      <Layout.Content>
        <Body>
          <div
            style={{
              textAlign: "center",
              fontSize: 80,
              paddingTop: 32,
              paddingBottom: 48,
              marginLeft: -138,
              color: "#f5a70c",
            }}
          >
            谱写频传&nbsp;&nbsp;&nbsp;&nbsp;决胜千里
          </div>
          <div className="mc-send-page__image" />
          <div className="mc-send-page__board">
            <div className="mc-send-page__board-title">
              <Icon size="6px">dot</Icon>
              <Box paddingLeft="10px">点击下方操作按钮开始执行任务</Box>
            </div>
            <Align align="center">
              <Dropdown
                placement="topLeft"
                overlay={
                  <Menu>
                    <Menu.Item onClick={() => history.push("/tx/scan?type=CW")}>CW</Menu.Item>
                    <Menu.Item onClick={() => history.push("/tx/scan?type=CW")}>CW</Menu.Item>
                  </Menu>
                }
              >
                <Button size="large" type="primary">
                  <span>智能识报</span>
                  <Icon>scan</Icon>
                </Button>
              </Dropdown>
              <Dropdown
                placement="topLeft"
                overlay={
                  <Menu>
                    <Menu.Item onClick={() => history.push("/telegram/code?type=EX")}>EX</Menu.Item>
                    <Menu.Item onClick={() => history.push("/telegram/code?type=CCK")}>
                      CW
                    </Menu.Item>
                    {/* <Menu.Item onClick={() => history.push("/telegram/code?type=CW")}>
                      KCB
                    </Menu.Item> */}
                  </Menu>
                }
              >
                <Button size="large" type="primary">
                  <span>手动输入</span>
                  <Icon>grid</Icon>
                </Button>
              </Dropdown>
            </Align>
          </div>
          <Panel width={300} title="待发报文" className="mc-send-page__panel">
            {telegrams.map((it, ix) => (
              <Card key={ix} stat={it} />
            ))}
          </Panel>
        </Body>
      </Layout.Content>
    </Layout>
  );
};

export default withTabbar(Home)("tx");

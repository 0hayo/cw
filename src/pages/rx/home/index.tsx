import "./index.less";
import Card from "./card";
import { Layout } from "antd";
import useData from "./useData";
import React, { FC } from "react";
import Box from "components/mc-box";
import Icon from "components/mc-icon";
import Body from "components/mc-body";
import Panel from "components/mc-panel";
import Align from "components/mc-align";
import withTabbar from "hoc/withTabbar";
import Header from "containers/mc-header-terminal";
import { useHistory } from "react-router";
import McButton from "components/mc-button";

const McRecvHomePage: FC = () => {
  const data = useData();
  const history = useHistory();

  return (
    <Layout className="mc-recv-page">
      <Layout.Header>
        <Header>智能收报中心</Header>
      </Layout.Header>
      <Layout.Content>
        <Body className="mc-recv-page__body">
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
            一字一码&nbsp;&nbsp;&nbsp;&nbsp;千军万马
          </div>
          <div className="mc-recv-page__image" />
          <div className="mc-recv-page__board">
            <div className="mc-recv-page__board-title">
              <Icon size="6px">dot</Icon>
              <Box paddingLeft="10px">目前什么都没有开始，点击下方操作按钮开始执行任务吧！</Box>
            </div>
            <Align align="center">
              <McButton
                icon="recv"
                size="large"
                type="primary"
                onClick={() => history.push("/rx/ready?scene=ready&receive=true")}
              >
                开始辅助收报
              </McButton>
              {/* <McButton icon="recv" size="large" type="primary">
                模拟收报
              </McButton> */}
            </Align>
          </div>
          <Panel width="300px" title="已收报文" className="mc-recv-page__panel">
            {data.map((it, ix) => (
              <Card key={ix} stat={it} />
            ))}
          </Panel>
        </Body>
      </Layout.Content>
    </Layout>
  );
};

export default withTabbar(McRecvHomePage)("rx");

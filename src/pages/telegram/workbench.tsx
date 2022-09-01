import React, { FC, useContext } from "react";
import { Button, Dropdown, Menu } from "antd";
import {
  CameraOutlined,
  FileTextOutlined,
  InsertRowBelowOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useHistory } from "react-router";
import MstContext from "containers/mst-context/context";

const Workbench: FC = () => {
  const history = useHistory();
  const { appType } = useContext(MstContext);

  return (
    <div className="processing_hi">
      <div className="processing_top">
        <div className="processing_title">快速办报</div>
        <div className="processing_text">通过多种手段智能识别报底。</div>
      </div>
      <div className="processing_left_ul">
        <div className="processing_left_list">
          <div className="list_detail">
            <div className="list_detail_name">
              拍照识别 <CameraOutlined />
            </div>
            <div className="list_detail_text">
              采用高拍仪,对电子报底进行拍摄；一键智能识别报底生成电子报底
            </div>
          </div>
          <div className="list_btm">
            <Button
              type="primary"
              onClick={() => history.push("/telegram/scan?type=CW&mode=video")}
            >
              开始拍照识别
              <CameraOutlined />
            </Button>
          </div>
        </div>
        <div className="processing_left_list">
          <div className="list_detail">
            <div className="list_detail_name">
              文件识别 <FileTextOutlined />
            </div>
            <div className="list_detail_text">
              对存储在本机的文件进行识别；一键智能识别文件生成电子报底
            </div>
          </div>
          <div className="list_btm">
            <Button type="primary" onClick={() => history.push("/files/import")}>
              开启文件识别
              <FileTextOutlined />
            </Button>
          </div>
        </div>
        <div className="processing_left_list">
          <div className="list_detail">
            <div className="list_detail_name">
              手动输入 <InsertRowBelowOutlined />
            </div>
            <div className="list_detail_text">采用键盘的方式手动输入报文，生成电子报底</div>
          </div>
          <div className="list_btm">
            <Dropdown
              placement="topLeft"
              overlay={
                <Menu>
                  <Menu.Item onClick={() => history.push("/telegram/code?type=EX")}>EX</Menu.Item>
                  <Menu.Item onClick={() => history.push("/telegram/code?type=CCK")}>CW</Menu.Item>
                  {/*<Menu.Item onClick={() => history.push("/telegram/code?type=KCB")}>KCB</Menu.Item>*/}
                </Menu>
              }
            >
              <Button type="primary">
                开启手动输入
                <InsertRowBelowOutlined />
              </Button>
            </Dropdown>
          </div>
        </div>
        {/*<div className="processing_left_list">*/}
        {/*  <div className="list_detail">*/}
        {/*    <div className="list_detail_name">训练报生成</div>*/}
        {/*    <div className="list_detail_text">使用智能算法，根据用户配置自动生成训练报</div>*/}
        {/*  </div>*/}
        {/*  <div className="list_btm">*/}
        {/*    <Button type="primary">*/}
        {/*      开启训练报文*/}
        {/*      <OneToOneOutlined />*/}
        {/*    </Button>*/}
        {/*  </div>*/}
        {/*</div>*/}
        <div style={{ display: "flex", justifyContent: "center" }}>
          {appType === "single" && (
            <Dropdown
              placement="topLeft"
              overlay={
                <Menu>
                  <Menu.Item onClick={() => history.push("/cw?mode=rx&datagramType=TELR&type=EX")}>
                    EX
                  </Menu.Item>
                  <Menu.Item onClick={() => history.push("/cw?mode=rx&datagramType=TELR&type=CCK")}>
                    CW
                  </Menu.Item>
                </Menu>
              }
            >
              <Button
                type="primary"
                style={{
                  background: "#49AA19",
                  borderRadius: "2px",
                  width: "245px",
                  height: "64px",
                  fontSize: "24px",
                }}
                onClick={() => {
                  history.push("/cw?mode=rx&datagramType=TELR&type=CCK");
                }}
              >
                开始收报
                <SendOutlined rotate={135} style={{ marginTop: 6 }} />
              </Button>
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workbench;

import "./index.less";
import React, { FC, useEffect, useState } from "react";
import DeviceList from "./deviceList";
import withTabbar from "hoc/withTabbar";
import { Button, Dropdown, Menu } from "antd";
import McIcon from "components/mc-icon";
import { SendOutlined } from "@ant-design/icons";
import { useHistory } from "react-router";
import McTaskModal from "components/mc-task-model";
import McTaskList from "components/mc-task-list";
import useMounted from "hooks/useMounted";
import fetch from "utils/fetch";
// import { setControlRadio } from "misc/env";

const WorkBench: FC = () => {
  const mounted = useMounted();
  //当前选择的设备
  const [currentRadioItem, setCurrentRadioItem] = useState<IRadioItem>(null);
  const [contactTable, setContactTable] = useState<ISysContactTable>();

  const [taskModalVisible, setTaskModalVisible] = useState(false);

  const [updateCnt, setUpdateCnt] = useState<number>(0);

  const history = useHistory();

  /** 获取当前设备所属网系（联络文件表） */
  useEffect(() => {
    const contactTableId = currentRadioItem?.contactId;
    if (!contactTableId) return;
    const wait = fetch.get<ManageResponse>(`/sysContactTable/get/${contactTableId}`);
    Promise.resolve(wait).then(response => {
      const _contactTable: ISysContactTable = response.data?.data;
      setContactTable(_contactTable);
    });
  }, [currentRadioItem]);

  return (
    <div className="workbench">
      {/* 左侧设备 */}
      {mounted.current && (
        <DeviceList
          currentRadioItem={currentRadioItem}
          onItemClick={radio => {
            setCurrentRadioItem(radio);
            // setControlRadio(radio?.uuid, radio?.ip);
          }}
        />
      )}
      {/* 右侧工作台区域 */}
      {currentRadioItem == null && <div className="workbench_right_blank"></div>}
      {currentRadioItem != null && (
        <div className="workbench_right">
          <div className="workbench_right_operation">
            <div className="operation_title">
              <div className="title_blod">{currentRadioItem.name}</div>
            </div>
            <div className="radio_infos">
              <div className="radio_info">
                <div className="radio_info_title">终端地址：</div>
                <div className="radio_info_value">{currentRadioItem.ip}</div>
              </div>
              <div className="radio_info">
                <div className="radio_info_title">工作网系：</div>
                <div className="radio_info_value">{contactTable?.contactName}</div>
              </div>
            </div>
            <div className="workbench_operation_detail">
              <div className="operation_detail_text">提示</div>
              {currentRadioItem.status === 0 ? (
                <div className="operation_detail_text">
                  未取得终端控制权，无法进行收发工作！
                  <br />
                  点击左侧接管设备按钮即可取得终端控制权。
                  <div></div>
                  <div> 终端在进行收发报任务时无法被接管。</div>
                </div>
              ) : currentRadioItem.status === 1 ? (
                <div className="operation_detail_text_green">
                  已取得终端控制权，
                  <br />
                  点击下方“发报或收报”按钮即可开始收发报工作！
                </div>
              ) : (
                <div className="operation_detail_text">终端离线，无法进行远控。</div>
              )}
            </div>
            <div className="workbench_operation_btn_list">
              <Button
                type="primary"
                disabled={currentRadioItem.status !== 1}
                className="terminal_action_btn"
                onClick={() => {
                  history.push(
                    `/cw?radioUuid=${currentRadioItem.uuid}&ip=${currentRadioItem.ip}&mode=tx&contactId=${currentRadioItem.contactId}&datagramType=TELS`
                  );
                }}
              >
                开始发报
                <SendOutlined rotate={-45} style={{ marginBottom: 2 }} />
              </Button>

              <Dropdown
                disabled={currentRadioItem.status !== 1}
                placement="topLeft"
                overlay={
                  <Menu>
                    <Menu.Item
                      onClick={() => {
                        history.push(
                          `/cw?radioUuid=${currentRadioItem.uuid}&ip=${currentRadioItem.ip}&mode=rx&type=CCK&datagramType=TELR&contactId=${currentRadioItem.contactId}`
                        );
                      }}
                    >
                      CW
                    </Menu.Item>
                    {/*<Menu.Item*/}
                    {/*  onClick={() => history.push("/cw?mode=rx&datagramType=TELR&type=CW")}*/}
                    {/*>*/}
                    {/*  KCB*/}
                    {/*</Menu.Item>*/}
                    <Menu.Item
                      onClick={() => {
                        history.push(
                          `/cw?radioUuid=${currentRadioItem.uuid}&ip=${currentRadioItem.ip}&mode=rx&type=EX&datagramType=TELR&contactId=${currentRadioItem.contactId}`
                        );
                      }}
                    >
                      EX
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button
                  type="primary"
                  disabled={currentRadioItem.status !== 1}
                  className="terminal_action_btn_recv"
                  onClick={() => {
                    // history.push(
                    //   `/cw?radioUuid=${currentRadioItem.uuid}&ip=${currentRadioItem.ip}&mode=rx&datagramType=TELR&contactId=${currentRadioItem.contactId}`
                    // );
                  }}
                >
                  开始收报
                  <SendOutlined rotate={135} style={{ marginTop: 6 }} />
                </Button>
              </Dropdown>
              <Button
                type="primary"
                className="terminal_action_btn"
                onClick={e => setTaskModalVisible(true)}
              >
                指派任务<McIcon>assign</McIcon>
              </Button>
            </div>
            <div className="operation_voice"></div>
          </div>
          <div className="workbench_right_ul">
            <McTaskList
              radio={currentRadioItem}
              contactTableId={currentRadioItem?.contactId}
              reload={updateCnt % 2 === 0}
              className="workbench-task-list"
            />
          </div>
        </div>
      )}

      {/* 新建任务 */}
      {taskModalVisible && (
        <McTaskModal
          mode="add"
          radioUuid={currentRadioItem.uuid}
          contactTableId={currentRadioItem.contactId}
          onCancel={() => setTaskModalVisible(false)}
          onOk={() => {
            setTaskModalVisible(false);
            setUpdateCnt(updateCnt + 1);
          }}
        />
      )}
    </div>
  );
};

export default withTabbar(WorkBench)("home");

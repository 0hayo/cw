import "./index.less";
import React, { FC, useState, useEffect, useContext } from "react";
import withTabbar from "hoc/withTabbar";
import Header from "containers/mc-header-terminal";
import { Layout, Select } from "antd";
import fetch from "utils/fetch";
import { IRadioPages, IRadioList, IForm } from "./form";
import McAvgData from "./echarts/useAvgData";
import McTotalData from "./echarts/useTotalData";
import McWorkedHours from "./echarts/useWorkedHours";
import McTime from "./echarts/useTime";
import McAvgTime from "./echarts/useAvgTime";
import MstContext from "containers/mst-context/context";
import { getAppType } from "misc/env";

const Statistics: FC = () => {
  const Option = Select;
  // 电台pages
  const [radioPages] = useState<IRadioPages>({
    currentPage: 1,
    pageSize: 100,
  });
  // 电台设备列表
  const [radioList, setRadioList] = useState<IRadioList>(null);
  // 电台uuid
  const [radioUuid, setRadioUuid] = useState(null);
  const [statistics, setStatistics] = useState<IForm>({
    sendTotal: 0, // 发送总数量
    collectTotal: 0, // 接收数量
    onlineTime: 0, //在线时长
    standbyTime: 0, // 待机时长
    avgTimeDaily: 0, // 平均每日在线时长
    avgTimeWeekly: 0, // 平均每周在线时长
    avgSendDaily: 0, //平均每日发报
    avgCollectDaily: 0, //平均每日收报
    avgSendWeekly: 0, //平均每周发报
    avgCollectWeekly: 0, //平均每周收报
    txWorkedHours: 0, // 发报工作时长
    rxWorkedHours: 0, // 收报工作时长
  });

  const { appType } = useContext(MstContext);

  // 请求智能收发设备列表
  useEffect(() => {
    const wait = fetch.post<ManageResponse>("/sysRadio/listPage", JSON.stringify(radioPages));
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) {
        setRadioList(x => ({
          ...x,
          items: result.data.items.sort((a, b) => (a.uuid > b.uuid ? 1 : -1)),
        }));
      }
    });
  }, [radioPages, setRadioList]);

  return (
    <Layout className="mc-statistics-page">
      {getAppType() === "terminal" && (
        <Layout.Header>
          <Header>数据中心</Header>
        </Layout.Header>
      )}
      <div className="statistics">
        {appType === "control" && (
          <div className="statistics_select">
            <Select
              defaultValue="所有设备"
              dropdownClassName="downSelect"
              className="select"
              style={{ width: 198 }}
              onChange={e => setRadioUuid(e)}
            >
              <Option value={""}>所有设备</Option>
              {radioList &&
                radioList.items.map(item => {
                  return (
                    <Option value={item.uuid} key={item.uuid}>
                      {item.name}
                    </Option>
                  );
                })}
            </Select>
          </div>
        )}
        <div className="statistics_ul">
          <div className="statistics_left">
            {/* 总发报数 */}
            <div className="statistics_list">
              <div className="statistics_img">
                <McTotalData
                  uuid={radioUuid}
                  type="1"
                  groupType="1"
                  handlerChange={total => setStatistics(x => ({ ...x, sendTotal: total }))}
                />
              </div>
              <div className="statistics_detail">
                <div className="statistics_title">
                  <div className="statistics_number">{statistics.sendTotal}</div>
                  <div className="statistics_text">篇</div>
                </div>
                <div className="statistics_name">-总发报数</div>
              </div>
            </div>
            {/* 总收报数 */}
            <div className="statistics_list">
              <div className="statistics_img">
                <McTotalData
                  uuid={radioUuid}
                  type="2"
                  groupType="1"
                  handlerChange={total => setStatistics(x => ({ ...x, collectTotal: total }))}
                />
              </div>
              <div className="statistics_detail">
                <div className="statistics_title">
                  <div className="statistics_number">{statistics.collectTotal}</div>
                  <div className="statistics_text">篇</div>
                </div>
                <div className="statistics_name">-总收报数</div>
              </div>
            </div>
            {/* 在线时长 */}
            <div className="statistics_list">
              <div className="statistics_img">
                <McTime
                  uuid={radioUuid}
                  type="1"
                  groupType="1"
                  handlerChange={total => setStatistics(x => ({ ...x, onlineTime: total }))}
                />
              </div>
              <div className="statistics_detail">
                <div className="statistics_title">
                  <div className="statistics_number">{statistics.onlineTime}</div>
                  <div className="statistics_text">小时</div>
                </div>
                <div className="statistics_name">-在线时长</div>
              </div>
            </div>
            {/* 平均发报 */}
            <div className="statistics_list">
              <div className="statistics_img">
                <McAvgData
                  uuid={radioUuid}
                  type="1"
                  groupType="1"
                  handlerChange={total => setStatistics(x => ({ ...x, avgSendDaily: total }))}
                />
                <div className="statistics_img_pie">
                  <div className="pie_number">
                    {statistics.avgSendDaily} <span>篇</span>
                  </div>
                  <div className="pie_text">平均每日发报</div>
                </div>
              </div>
              <div className="statistics_img">
                <McAvgData
                  uuid={radioUuid}
                  type="1"
                  groupType="2"
                  handlerChange={total => setStatistics(x => ({ ...x, avgSendWeekly: total }))}
                />
                <div className="statistics_img_pie">
                  <div className="pie_number">
                    {statistics.avgSendWeekly} <span>篇</span>
                  </div>
                  <div className="pie_text">平均每周发报</div>
                </div>
              </div>
            </div>
            {/* 平均收报 */}
            <div className="statistics_list">
              <div className="statistics_img">
                <McAvgData
                  uuid={radioUuid}
                  type="2"
                  groupType="1"
                  handlerChange={total => setStatistics(x => ({ ...x, avgCollectDaily: total }))}
                />
                <div className="statistics_img_pie">
                  <div className="pie_number">
                    {statistics.avgCollectDaily} <span>篇</span>
                  </div>
                  <div className="pie_text">平均每日收报</div>
                </div>
              </div>
              <div className="statistics_img">
                <McAvgData
                  uuid={radioUuid}
                  type="2"
                  groupType="2"
                  handlerChange={total => setStatistics(x => ({ ...x, avgCollectWeekly: total }))}
                />
                <div className="statistics_img_pie">
                  <div className="pie_number">
                    {statistics.avgCollectWeekly} <span>篇</span>
                  </div>
                  <div className="pie_text">平均每周收报</div>
                </div>
              </div>
            </div>
            {/* 平均在线时长 */}
            <div className="statistics_list">
              <div className="statistics_img">
                <McAvgTime
                  uuid={radioUuid}
                  type="1"
                  groupType="1"
                  handlerChange={total => setStatistics(x => ({ ...x, avgTimeDaily: total }))}
                />
                <div className="statistics_img_pie">
                  <div className="pie_number">
                    {statistics.avgTimeDaily} <span>小时</span>
                  </div>
                  <div className="pie_text">平均每日在线</div>
                </div>
              </div>
              <div className="statistics_img">
                <McAvgTime
                  uuid={radioUuid}
                  type="1"
                  groupType="2"
                  handlerChange={total => setStatistics(x => ({ ...x, avgTimeWeekly: total }))}
                />
                <div className="statistics_img_pie">
                  <div className="pie_number">
                    {statistics.avgTimeWeekly} <span>小时</span>
                  </div>
                  <div className="pie_text">平均每周在线</div>
                </div>
              </div>
            </div>
          </div>

          <div className="statistics_right">
            <div className="statistics_img">
              <McTime
                uuid={radioUuid}
                type="0"
                groupType="1"
                handlerChange={total => setStatistics(x => ({ ...x, standbyTime: total }))}
              />
            </div>
            <div className="statistics_title">
              <div className="statistics_number">{statistics.standbyTime}</div>
              <div className="statistics_text">小时</div>
            </div>
            <div className="statistics_name">-待机时长</div>
          </div>

          <div className="statistics_right">
            <div className="statistics_name">收报时长统计：{statistics.rxWorkedHours}小时</div>
            <McWorkedHours
              uuid={radioUuid}
              type="rx"
              handlerChange={total => setStatistics(x => ({ ...x, rxWorkedHours: total }))}
            />
            <div className="statistics_name">发报时长统计：{statistics.txWorkedHours}小时</div>
            <McWorkedHours
              uuid={radioUuid}
              type="tx"
              handlerChange={total => setStatistics(x => ({ ...x, txWorkedHours: total }))}
            />
            <div className="statistics_name">机上用语错误数量：0</div>
            <div className="statistics_name">收报报文质量正确率：100%</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withTabbar(Statistics)("board");

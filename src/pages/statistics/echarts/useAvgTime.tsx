import React, { FC, useState, useEffect, useContext } from "react";
import ReactEchartsCore from "echarts-for-react/lib/core";
import fetch from "utils/fetch";

import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import {
  CanvasRenderer,
  // SVGRenderer,
} from "echarts/renderers";
import MstContext from "containers/mst-context/context";
import { LOCAL_MACHINE_ID as radioUuid } from "misc/env";
echarts.use([GridComponent, PieChart, CanvasRenderer]);

interface IProps {
  uuid: string; // 电台UUid
  type: string; // 时间类型，0(待机), 1(在线)
  groupType: string; // 汇总类型（1:按天 2:按周）
  handlerChange: (total: number) => void;
}

interface IForm {
  max: number;
  min: number;
}

const McAvgTime: FC<IProps> = ({ uuid, type, groupType, handlerChange }) => {
  const { appType } = useContext(MstContext);
  if (appType !== "control") {
    uuid = radioUuid;
  }

  const [sendData, setSendData] = useState<IForm>({
    max: 0,
    min: 0,
  });

  // 请求智能收发设备列表
  useEffect(() => {
    const url = uuid
      ? `/sysRadioOperational/report/${type}/${groupType}?radioUuid=${uuid}`
      : `/sysRadioOperational/report/${type}/${groupType}`;
    const wait = fetch.get<ManageResponse>(url);
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1 && result.data) {
        setSendData(x => ({
          ...x,
          max: result.data.maxTotal,
          min: result.data.minTotal,
        }));
        handlerChange(result.data.avgTotal);
      }
    });
    // eslint-disable-next-line
  }, [setSendData, uuid]);

  const getOption = () => {
    return {
      series: [
        {
          type: "pie",
          radius: ["76%", "90%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "inside",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "14",
              fontWeight: "bold",
              color: "#fff",
              verticalAlign: "middle",
              align: "center",
              padding: [0, 20],
              formatter: params => {
                const text = params.data.value + "\n" + params.data.name;
                return text;
              },
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            {
              value: sendData.min,
              name: "最低在线时长",
              itemStyle: { color: "rgba(80,87,136,0.7)" },
            },
            { value: sendData.max, name: "最高在线时长", itemStyle: { color: "#6873C6" } },
          ],
        },
      ],
    };
  };
  return (
    <ReactEchartsCore
      style={{ background: "transparent", height: "140px" }}
      echarts={echarts}
      option={getOption()}
    />
  );
};
export default McAvgTime;

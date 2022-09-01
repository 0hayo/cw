import React, { FC, useState, useEffect, useContext } from "react";
import ReactEchartsCore from "echarts-for-react/lib/core";
import fetch from "utils/fetch";

import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import {
  CanvasRenderer,
  // SVGRenderer,
} from "echarts/renderers";
import MstContext from "containers/mst-context/context";
import { LOCAL_MACHINE_ID as radioUuid } from "misc/env";

echarts.use([GridComponent, LineChart, CanvasRenderer]);
interface IProps {
  uuid: string;
  type: string;
  groupType: string;
  handlerChange: (total: number) => void;
}

const McTotalData: FC<IProps> = ({ uuid, type, groupType, handlerChange }) => {
  const { appType } = useContext(MstContext);
  if (appType !== "control") {
    uuid = radioUuid;
  }

  const [total, setTotal] = useState(null);
  const color =
    type === "1"
      ? [
          {
            offset: 0,
            color: "rgba(68,215,182, 0.6)", // 0% 处的颜色
          },
          {
            offset: 1,
            color: "rgba(68,215,182, 0.2)", // 100% 处的颜色
          },
        ]
      : [
          {
            offset: 0,
            color: "rgba(50,197,255, 0.6)", // 0% 处的颜色
          },
          {
            offset: 1,
            color: "rgba(50,197,255, 0.2)", // 100% 处的颜色
          },
        ];
  // 请求智能收发设备列表
  useEffect(() => {
    const url = uuid
      ? `/sysTaskDatagramRelation/report_detail/${type}/${groupType}?radioUuid=${uuid}`
      : `/sysTaskDatagramRelation/report_detail/${type}/${groupType}`;
    const wait = fetch.get<ManageResponse>(url);
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1 && result.data) {
        setTotal(result.data.details);
        handlerChange(result.data.total);
      }
    });
    // eslint-disable-next-line
  }, [setTotal, uuid]);

  const getOption = () => {
    return {
      grid: {
        x: 20,
        y: 45,
        x2: 30,
        y2: 30,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        show: false,
      },
      yAxis: {
        type: "value",
        show: false,
      },
      series: [
        {
          data: total,
          type: "line",
          symbol: "none",
          lineStyle: {
            color: "rgba(68,215,182, 0.2 )",
          },
          areaStyle: {
            color: {
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: color,
              symbolKeepAspect: true,
            },
          },
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
export default McTotalData;

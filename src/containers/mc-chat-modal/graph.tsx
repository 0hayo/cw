import React, { FC, useEffect } from "react";
import useGuid from "hooks/useGuid";
import highcharts from "highcharts/highstock";

interface IProps {
  message?: Message;
}

const McGraph: FC<IProps> = ({ message }) => {
  const guid = useGuid();

  useEffect(() => {
    let chars: string[] = [];
    if (message) {
      chars = (message.crude || message.value).split("");
    }

    highcharts.chart(`mc-${guid}`, {
      chart: {
        spacing: [10, 0, 0, 0],
        backgroundColor: "transparent",
      },
      title: {
        text: "",
      },
      legend: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        scrollbar: {
          enabled: chars.length > 20,
        },
        categories: chars,
        max: chars.length > 20 ? 20 : null,
        labels: {
          style: {
            color: "#32C5FF",
            fontSize: "14px",
          },
        },
      },
      yAxis: {
        title: {
          text: "",
        },
        tickPositions: [0, 25, 50, 75, 100],
        labels: {
          formatter: function () {
            if (this.value === 0) {
              return "0";
            }
            return this.value + "%";
          },
          style: {
            color: "#32C5FF",
            fontSize: "14px",
          },
        },
      },
      series: [
        {
          name: "概率",
          type: "column",
          data: message ? message.ratio : [],
          animation: false,
          colorByPoint: true,
          dataLabels: {
            enabled: true,
            format: "{point.y}%",
          },
          tooltip: {
            headerFormat: "报码: {point.key}<br>",
            pointFormat: "概率: {point.y}%",
          },
        },
      ],
    });
  }, [guid, message]);

  return <div id={`mc-${guid}`} className="mc-ratio-graph" />;
};

export default McGraph;

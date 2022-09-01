import "./device.less";
import React, { FC, useState, useEffect } from "react";
import DeviceCard from "./card";
import RadioService from "services/radio-service";

// 终端设备管理
const DeviceManagement: FC = () => {
  //  定义智能收发设备信息 请求参数
  const [pages] = useState<IFormPages>({
    currentPage: 1,
    pageSize: 100,
  });
  const [radioList, setRadioList] = useState<IRadioItem[]>([]);
  const [scrollHeight, setScrollHeight] = useState(0);

  // 请求智能收发设备列表
  useEffect(() => {
    const wait = RadioService.getAllRadios();
    Promise.resolve(wait).then(result => {
      setRadioList(result);
    });
    //设置滚动区域高度
    const el = document.getElementById("mc-device-body");
    setScrollHeight(el.clientHeight - 40);
  }, [pages, setRadioList]);

  return (
    <div className="device_body" id="mc-device-body">
      <div className="device_ul" style={{ height: scrollHeight }}>
        {radioList &&
          radioList.map(item => (
            <DeviceCard
              key={`mc-radio-card-${item.uuid}`}
              data={item}
              onSave={data => {}}
              onDelete={data => {
                setRadioList(radioList.filter(x => x.uuid !== data.uuid));
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default DeviceManagement;

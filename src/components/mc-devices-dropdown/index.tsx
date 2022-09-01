import "./index.less";
import React, { FC, useEffect, useState } from "react";
import fetch from "utils/fetch";
import { Select } from "antd";

interface IProps {
  radioUuid?: string;
  /** 是否显示“所有设备选项” */
  all?: boolean;
  onChange: (radio: IRadioItem) => void;
}

const McDeviceDropdown: FC<IProps> = ({ radioUuid, all = true, onChange }) => {
  const { Option } = Select;
  // 电台设备列表
  const [radioList, setRadioList] = useState<IRadioItem[]>(null);
  const [currRadio, setCurrRadio] = useState<IRadioItem>();
  const [currRadioUuid, setCurrRadioUuid] = useState<string>("");

  // 请求智能收发设备列表
  useEffect(() => {
    const wait = fetch.post<ManageResponse>(
      "/sysRadio/listPage",
      JSON.stringify({
        currentPage: 1,
        pageSize: 100,
      })
    );
    Promise.resolve(wait).then(response => {
      const result = response.data;
      if (result.status === 1) {
        setRadioList(x => result.data.items.sort((a, b) => (a.uuid > b.uuid ? 1 : -1)));
      }
    });
  }, [setRadioList]);

  /** 如果有传入radioUuid, 电台列表加载后，返回对应的Radio对象 */
  useEffect(() => {
    if (currRadio && onChange && radioList) {
      onChange(currRadio);
    } else if (radioUuid && onChange && radioList) {
      const radio = radioList?.find(x => x.uuid === radioUuid);
      setCurrRadio(radio);
      // setCurrRadioUuid( radio ? radio.uuid : "" );
      onChange(radio);
    } else if (!radioUuid) {
      onChange(null);
    }
    //eslint-disable-next-line
  }, [radioList, currRadio]);

  return (
    <div className="mc_devices_dropdown">
      <Select
        dropdownClassName="downSelect"
        className="select"
        value={currRadioUuid}
        onChange={value => {
          const target = radioList.find(x => x.uuid === value);
          console.log("target:", target);
          // alert(target);
          setCurrRadio(target ? target : ({ uuid: "" } as IRadioItem));
          setCurrRadioUuid(target ? target.uuid : "");
        }}
      >
        {all && <Option value="">所有设备</Option>}
        {radioList &&
          radioList.map(item => (
            <Option value={item.uuid} key={item.uuid}>
              {item.name}
            </Option>
          ))}
      </Select>
    </div>
  );
};

export default McDeviceDropdown;

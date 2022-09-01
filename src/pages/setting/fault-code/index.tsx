import "./index.less";
import React, { FC } from "react";
import DictionaryService from "services/dictionary-service";
import useAutoHeight from "hooks/useAutoHeight";

const McSysFaultCode: FC = () => {
  const faultCodeList = DictionaryService.getDictItems("sys_error_code");
  const height = useAutoHeight("fault-body", 128);

  return (
    <div className="fault_body" id="fault-body">
      <div className="dev_header">
        <div className="header_major_tile">系统故障代码对照表及处理建议</div>
        <div className="header_sub_tile">
          <div className="sub_item_fix" style={{ width: "80px" }}>
            序号
          </div>
          <div className="sub_item_fix" style={{ width: "180px" }}>
            故障编号
          </div>
          <div className="sub_item_fix" style={{ width: "200px", alignItems: "flex-start" }}>
            故障描述
          </div>
          <div
            className="sub_item_fix"
            style={{
              border: "none",
              paddingLeft: "10px",
              flex: "1",
              justifyContent: "flex-start",
            }}
          >
            处理建议
          </div>
        </div>
      </div>
      {/* client */}
      <div className="item_scroll" style={{ height: height }}>
        {faultCodeList &&
          faultCodeList.map(item => {
            return (
              <div className="client_style" key={item.uuid}>
                <div className="sub_item_fix" style={{ width: "80px" }}>
                  {item.sort}
                </div>
                <div className="sub_item_fix" style={{ width: "180px" }}>
                  {item.value}
                </div>
                <div className="sub_item_fix" style={{ width: "200px", alignItems: "flex-start" }}>
                  {item.title}
                </div>
                <div
                  className="sub_item_fix"
                  style={{
                    alignItems: "flex-start",
                    border: "none",
                    paddingLeft: "10px",
                    flex: "1",
                    gap: "10px",
                  }}
                >
                  {(() => {
                    try {
                      const obj = JSON.parse(item.desc);
                      return (
                        <div className="solution-wrapper">
                          {obj && obj.map(it => <div>{it}</div>)}
                        </div>
                      );
                    } catch (e) {
                      return (
                        <div className="solution-wrapper">
                          <div>{item.desc}</div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default McSysFaultCode;

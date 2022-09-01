import "./index.less";
import React, { FC, useContext, useEffect, useState } from "react";
import McTelegramList from "components/mc-telegram-list";
import withTabbar from "hoc/withTabbar";
import Workbench from "./workbench";
import McTaskList from "components/mc-task-list";
import MstContext from "containers/mst-context/context";

const TelegramPage: FC = () => {
  // const [onTaskChange, SetOnTaskChange] = useState<boolean>(false);

  // const [taskList, setTaskList] = useState<ITaskList>(null);

  // const handleChange = () => {
  //   // setTaskList(x => ({ ...x, items: [] }));
  //   setPages(x => ({ ...x, currentPage: 1 }));
  // };
  const { appType } = useContext(MstContext);
  const [reload, setReload] = useState(false);
  const [height, setHeight] = useState(500);

  useEffect(() => {
    const el = document.getElementById("processing-page");
    const _height = el.clientHeight;
    setHeight(_height - 166);
  }, []);

  return (
    <div id="processing-page" className="processing">
      {/* 办公工作台左侧内容 */}
      <Workbench />
      {/* 待发报文 */}
      <div
        className="processing_ready margin"
        style={appType === "single" ? { width: "100%" } : {}}
      >
        <div className="ready_top">
          <div className="ready_top_name">电子报底</div>
          <div className="ready_top_text">通过办报保存未发的报文，可以在此修改</div>
        </div>
        <div className="telegram-list" style={{ height: height }}>
          <McTelegramList onChange={() => setReload(!reload)} hideFun={() => {}} />
        </div>
      </div>
      {/* 任务列表 */}
      {appType !== "single" && <McTaskList className="telegram_task_list" pageSize={15} />}
    </div>
  );
};

export default withTabbar(TelegramPage)("home");

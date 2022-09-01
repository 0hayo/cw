import "./index.less";
import React, { FC, useState } from "react";
// import Assign from "images/base/assign.png";
import InfiniteScroll from "react-infinite-scroller";
import { FormOutlined, DeleteOutlined, SendOutlined } from "@ant-design/icons";
import McTaskModal from "components/mc-task-model";
import useRemove from "./useRemove";
import useData from "./useData";
import { Modal, Tooltip } from "antd";
import { useHistory } from "react-router";
import { IFormTelegramPages } from "./types";
import McTaskExecModal from "components/mc-exec-task-modal/index";
import McTelegramPreview from "components/mc-telegram-preview";
import { getAppType } from "misc/env";
import { logInfo } from "misc/util";

interface IProps {
  directGo?: boolean;
  onChange?: () => void; // 点击弹出 分配任务列表
  hideFun?: VoidFunction;
  onSelect?: (telegram: McDatagramItem) => void;
}

const EMPTY_TASK: ITask = {
  completeFlag: 0,
  radioUuid: "",
  name: "",
  title: "",
  type: undefined,
};
// const { appType } = useContext(MstContext);
// 待发报文组件
const McTelegramList: FC<IProps> = ({ directGo = false, onChange, hideFun, onSelect }) => {
  // 待发报文请求参数
  const [pages, setPages] = useState<IFormTelegramPages>({
    currentPage: 1,
    pageSize: 15,
    type: 1,
    status: 0,
  });
  // 定义 待发报文
  const [telegram, setTelegram] = useState<IPageResult<ITelegram>>(null);
  // eslint-disable-next-line
  const [reload, setReload] = useState<boolean>(false);
  const [task] = useState(EMPTY_TASK);
  const [currTelegram, setCurrTelegram] = useState<ITelegram>();
  const [preTeleUuid, setPreTeleUuid] = useState<string>();

  const remove = useRemove();
  useData(telegram, pages, setTelegram, reload);

  // 加载更多数据
  const handleInfiniteOnLoad = () => setPages(x => ({ ...x, currentPage: pages.currentPage + 1 }));

  const [propsModal, setIPropsModal] = useState<ITaskModal>({
    visible: false,
    datagramTitle: "",
    datagramUuid: "",
    taskName: "",
    startTime: "",
    remindTime: 10,
    remindLength: 10,
    workType: "1",
    mode: "add",
    id: null,
  });

  const [showExecModal, setShowExecModal] = useState(false);

  // const showTaskModal = propsModal => {
  //   setIPropsModal(x => ({
  //     ...x,
  //     radioUuid: propsModal.radioUuid,
  //     datagramUuid: propsModal.datagramUuid,
  //     datagramTitle: propsModal.datagramTitle,
  //     visible: propsModal.visible,
  //   }));
  //
  //
  //   // setTask({ ...task, datagramUuid: propsModal.datagramUuid, title: propsModal.datagramTitle });
  // };

  const history = useHistory();

  return (
    <div className="content_right_ul">
      {telegram && telegram.items ? (
        <InfiniteScroll
          initialLoad={false}
          pageStart={0}
          loadMore={handleInfiniteOnLoad}
          hasMore={Number(telegram.totalPage) > pages.currentPage}
          useWindow={false}
          style={{ height: "100%" }}
        >
          {telegram.items.map(item => {
            return (
              <div className="content_right_list" key={item.uuid}>
                <div className="list_left">
                  <div className="list_left_title" onClick={() => setPreTeleUuid(item.uuid)}>
                    {item.title}
                  </div>
                  <div className="list_left_text">更新时间：{item.updatedAt}</div>
                </div>
                <div className="list_right">
                  <Tooltip title="删除报文">
                    <DeleteOutlined
                      className="task_icon"
                      onClick={e => {
                        Modal.confirm({
                          centered: true,
                          maskClosable: false,
                          content: "您确定要删除吗？",
                          onOk: () => {
                            logInfo("删除电子报底: " + item.title);
                            remove(item.uuid);
                            setTelegram(x => ({ ...x, items: [] }));
                            // alert("删除成功！");
                            setPages(x => ({ ...x, currentPage: 1 }));
                            // setTelegram(x => ({ ...x, items: [] }));
                            // setPages(x => ({ ...x, currentPage: 1 }));
                            setReload(true);
                            // history.push("/telegram");
                          },
                        });
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="编辑报文">
                    <FormOutlined
                      className="task_icon"
                      onClick={() => {
                        //  alert("1")
                        history.push(`/telegram/input?from=${encodeURIComponent(item.uuid)}`);
                      }}
                    />
                  </Tooltip>
                  {/*<Tooltip title="指派任务">*/}
                  {/*  <img*/}
                  {/*    src={Assign}*/}
                  {/*    onClick={() => {*/}
                  {/*      showTaskModal({*/}
                  {/*        visible: true,*/}
                  {/*        radioUuid: item.radioUuid,*/}
                  {/*        datagramTitle: item.title,*/}
                  {/*        datagramUuid: item.uuid,*/}
                  {/*      });*/}
                  {/*    }}*/}
                  {/*    alt=""*/}
                  {/*  />*/}
                  {/*</Tooltip>*/}

                  <Tooltip title="立即发送">
                    <SendOutlined
                      className="task_icon"
                      rotate={-45}
                      style={{ marginBottom: 6 }}
                      onClick={() => {
                        setCurrTelegram(item);
                        hideFun();
                        if (getAppType() === "control" && !directGo) {
                          setShowExecModal(true);
                        } else {
                          history.push(`/cw?dir=${item.uuid}&mode=tx`);
                        }
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </InfiniteScroll>
      ) : null}

      {/* 分配任务 */}
      {propsModal.visible && (
        <McTaskModal
          mode="add"
          currTask={task}
          onCancel={() => setIPropsModal(x => ({ ...x, visible: false }))}
          onOk={() => {
            onChange && onChange();
            setIPropsModal(x => ({ ...x, visible: false }));
          }}
        />
      )}

      {/** 执行任务 */}
      {showExecModal && (
        <McTaskExecModal
          type="1"
          telegram={currTelegram}
          onCancel={() => setShowExecModal(false)}
        />
      )}
      {preTeleUuid && (
        <McTelegramPreview telegramUuid={preTeleUuid} onClose={() => setPreTeleUuid(null)} />
      )}
    </div>
  );
};
export default McTelegramList;

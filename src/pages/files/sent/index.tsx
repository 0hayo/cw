import "./index.less";
import Card from "./card";
import Filter from "../filter";
import { Layout } from "antd";
import useForm from "../useForm";
import useReady from "../useReady";
import React, { FC } from "react";
import useRemove from "../useRemove";
import withTabbar from "hoc/withTabbar";
import McBody from "components/mc-body";
import Loading from "components/mc-loading";
// import useExport from "../useExport";
import { getAppType } from "misc/env";
import Header from "containers/mc-header-terminal";
import InfiniteScroll from "react-infinite-scroller";
import MstPanel from "components/mst-panel";

const McSentPage: FC = () => {
  // const [form, setForm] = useForm("sent");
  const [form, setForm, setFormProp] = useForm("1");
  const [remove, batchRemove] = useRemove(setForm);
  useReady(form, setForm);
  // const exportFiles = useExport(setForm);
  const handleInfiniteOnLoad = () => {
    setFormProp("page")(form.page + 1);
  };

  return (
    <Layout className="mc-sent-file-page">
      <Layout.Content>
        {getAppType() === "terminal" && (
          <Layout.Header>
            <Header>文件管理</Header>
          </Layout.Header>
        )}
        <McBody>
          {/* <McFileMenu active="sent" /> */}
          <MstPanel title="已发报文" className="main-panel">
            <div className="mc-body-area">
              <Filter
                type={form.type}
                keyword={form.keyword}
                sortord={form.sortord}
                radioUuid={form.radioUuid}
                onChange={data => {
                  setForm({
                    ...form,
                    ...data,
                    page: 1,
                    folders: [],
                  });
                }}
                onExport={path => {
                  // exportFiles(form.checked, path);
                }}
                onDelete={() => {
                  batchRemove(form.checked);
                }}
                onCheckAll={flag => {
                  setForm(it => ({
                    ...it,
                    checked: flag ? it.folders : [],
                  }));
                }}
                checked={form.checked.length}
                total={form.folders.length}
              />
              <div className="mc-list-area-wrapper">
                {form.folders && (
                  <InfiniteScroll
                    className="mc-list-area"
                    initialLoad={false}
                    pageStart={0}
                    loadMore={handleInfiniteOnLoad}
                    hasMore={Number(form.totalPage) > form.page}
                    useWindow={false}
                    // loader={<Loading key={guid()}>正在加载</Loading>}
                  >
                    {form.folders.map(it => (
                      <Card
                        key={it.path}
                        stat={it}
                        checked={form.checked.find(x => x === it) !== undefined}
                        onDelete={() => remove(it)}
                        onCheck={(folder, checked) => {
                          const checkedFolders = checked
                            ? [...form.checked, folder]
                            : form.checked.filter(x => x !== folder);
                          setForm(it => ({
                            ...it,
                            checked: checkedFolders,
                          }));
                        }}
                      />
                    ))}
                  </InfiniteScroll>
                )}
              </div>
            </div>
          </MstPanel>
          {form.loading && <Loading position="absolute" top="30%" />}
        </McBody>
      </Layout.Content>
    </Layout>
  );
};

export default withTabbar(McSentPage)("files-sent");

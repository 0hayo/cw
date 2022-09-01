import "./index.less";
import Card from "./card";
import Filter from "./filter";
import { Layout } from "antd";
import useForm from "./useForm";
import useReady from "./useReady";
import React, { FC } from "react";
import useRemove from "./useRemove";
import withTabbar from "hoc/withTabbar";
import McBody from "components/mc-body";
import Loading from "components/mc-loading";
import McFileMenu from "containers/mc-file-menu";
import InfiniteScroll from "react-infinite-scroller";
import guid from "misc/guid";
import { getAppType } from "misc/env";
import Header from "containers/mc-header-terminal";

const McImportPage: FC = () => {
  const [form, setForm, setFormProp] = useForm();
  const remove = useRemove(setForm);
  useReady(form, setForm);
  const handleInfiniteOnLoad = () => {
    setFormProp("page")(form.page + 1);
  };

  return (
    <Layout className="mc-import-page">
      {getAppType() === "terminal" && (
        <Layout.Header>
          <Header>文件管理</Header>
        </Layout.Header>
      )}
      <Layout.Content>
        <McBody>
          <McFileMenu active="import" />
          <div className="mc-body-area">
            <Filter
              keyword={form.keyword}
              sortord={form.sortord}
              radioUuid={form.radioUuid}
              onChange={data => {
                setForm(x => ({
                  ...x,
                  ...data,
                  page: 1,
                  folders: [],
                }));
              }}
              onUpload={() => {
                setForm(x => ({
                  ...x,
                  page: 0,
                }));
                setForm(x => ({
                  ...x,
                  radioUuid: null,
                  keyword: "",
                  sortord: "date",
                  folders: [],
                  page: 1,
                }));
              }}
              onDelete={() => {
                remove(form.checked);
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
                      key={guid()}
                      folder={it}
                      mode={it.mode}
                      onDelete={() => remove([it])}
                      checked={form.checked.find(x => x.id === it.id) !== undefined}
                      onCheck={(folder, checked) => {
                        const checkedFolders = checked
                          ? [...form.checked, folder]
                          : form.checked.filter(x => x.id !== folder.id);
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
          {form.loading && <Loading position="absolute" top="30%" />}
        </McBody>
      </Layout.Content>
    </Layout>
  );
};

export default withTabbar(McImportPage)("files");

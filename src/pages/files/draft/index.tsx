import "./index.less";
import Card from "./card";
import Filter from "./filter";
import { Layout } from "antd";
import useForm from "./useForm";
import useReady from "./useReady";
import React, { FC, useCallback } from "react";
import useRemove from "./useRemove";
import withTabbar from "hoc/withTabbar";
import McBody from "components/mc-body";
import Loading from "components/mc-loading";
import { getAppType } from "misc/env";
import Header from "containers/mc-header-terminal";
import InfiniteScroll from "react-infinite-scroller";
import guid from "misc/guid";
import MstPanel from "components/mst-panel";

const McDraftPage: FC = () => {
  const [form, setForm] = useForm();
  const remove = useRemove(setForm);
  useReady(form, setForm);

  const handleInfiniteOnLoad = useCallback(() => {
    setForm(x => {
      return { ...x, page: x.page + 1 };
    });
  }, [setForm]);

  return (
    <Layout className="mc-draft-page">
      {getAppType() === "terminal" && (
        <Layout.Header>
          <Header>文件管理</Header>
        </Layout.Header>
      )}
      <Layout.Content>
        <McBody>
          {/* <McFileMenu active="draft" /> */}
          <MstPanel title="电子报底" className="main-panel">
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
                        stat={it}
                        onDelete={() => remove([it])}
                        checked={form.checked.find(x => x.path === it.path) !== undefined}
                        onCheck={(folder, checked) => {
                          const checkedFolders = checked
                            ? [...form.checked, folder]
                            : form.checked.filter(x => x.path !== folder.path);
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
              {/* {form.loading ? (
                <Loading />
              ) : (
                <div className="mc-list-area">
                  {form.folders.map(it => (
                    <Card
                      key={it.path}
                      stat={it}
                      onDelete={() => remove([it])}
                      checked={form.checked.find(x => x.path === it.path) !== undefined}
                      onCheck={(folder, checked) => {
                        const checkedFolders = checked
                          ? [...form.checked, folder]
                          : form.checked.filter(x => x.path !== folder.path);
                        setForm(it => ({
                          ...it,
                          checked: checkedFolders,
                        }));
                      }}
                    />
                  ))}
                </div>
              )} */}
            </div>
          </MstPanel>
          {form.loading && <Loading position="absolute" top="40%" />}
        </McBody>
      </Layout.Content>
    </Layout>
  );
};

export default withTabbar(McDraftPage)("files-draft");

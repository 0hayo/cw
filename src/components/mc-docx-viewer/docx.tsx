import React, { FC, useEffect, useState } from "react";
import { message, Pagination } from "antd";
import McIcon from "components/mc-icon";
import path from "path";
import PDF from "react-pdf-js";
import { remote } from "electron";
import fetch from "utils/fetch";
import McLoading from "components/mc-loading";

const pdfWorkerJs = remote.app.isPackaged
  ? path.join("file://", remote.app.getAppPath(), "build", "js", "pdf.worker.js")
  : path.join("/", "js", "pdf.worker.js");

interface IProps {
  active: number;
  docs: IScanImage[];
  onPrev?: (index: number) => void;
  onNext?: (index: number) => void;
}

const convertingTips = (
  <div>
    <McLoading>正在转换文件格式</McLoading>
    <div>(不影响识别)</div>
  </div>
);
const noFileTips = (
  <div>
    <div>没有待识别文件</div>
  </div>
);

const McDocViewer: FC<IProps> = ({ active, docs, onPrev, onNext }) => {
  const [pdfName, setPdfName] = useState<string>("");
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [docsNav, setDocsNav] = useState(false);
  const [tips, setTips] = useState(convertingTips);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const fullName = docs[active] ? docs[active].url : "";
    if (!fullName) return;
    const extName = path.extname(fullName);
    const name = fullName.replace(extName, ".pdf");

    // name && setPdfName(name);
    // const checkName = name.replace("file://", "");

    setDocsNav(docs.length > 1);
    if (docs.length === 0) {
      setPdfName("");
      setTips(noFileTips);
      setPages(0);
      setPage(0);
    }

    fetch.get(name).then(response => {
      const status = response.status;
      if (status === 200) {
        message.destroy();
        setPdfName(name);
      } else {
        setPdfName(null);
        if (docs.length > 0) {
          setTips(convertingTips);
        } else {
          setTips(noFileTips);
        }
      }
    });
  }, [docs, active, reload]);

  useEffect(() => {
    if (!pdfName) {
      setTimeout(() => setReload(reload + 1), 5000);
    }
  }, [reload, pdfName]);

  const onDocumentComplete = (pages: number) => {
    setPage(1);
    setPages(pages);
  };

  return (
    <div className="mc-docx-viewer__docs">
      <div
        className="mc-docx-viewer__docs-inner"
        style={{ overflowY: "auto", overflowX: "hidden" }}
      >
        <div className="mc-docx-viewer__docs-name">{docs[active]?.name}</div>
        {pdfName ? (
          <PDF
            file={pdfName}
            onDocumentComplete={onDocumentComplete}
            page={page}
            scale={1.3}
            workerSrc={pdfWorkerJs}
          />
        ) : (
          <div className="mc-docx-viewer__tips">{tips}</div>
        )}
      </div>
      {pages > 1 && (
        <div
          style={{
            textAlign: "center",
            position: "absolute",
            bottom: 32,
            width: "100%",
          }}
        >
          <Pagination total={pages} current={page} pageSize={1} onChange={page => setPage(page)} />
        </div>
      )}
      {docsNav && (
        <div>
          <div
            className="mc-docx-viewer__docs-prev"
            onClick={() => onPrev && onPrev(Math.max(0, active - 1))}
          >
            <McIcon size="33px" color="#32C5FF">
              prev
            </McIcon>
          </div>
          <div
            className="mc-docx-viewer__docs-next"
            onClick={() => onNext && onNext(Math.min(active + 1, docs.length - 1))}
          >
            <McIcon size="33px" color="#32C5FF">
              next
            </McIcon>
          </div>
        </div>
      )}
    </div>
  );
};

export default McDocViewer;

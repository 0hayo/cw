import "./index.less";
import React, { FC, useEffect } from "react";
import { McDocxData } from "./typing";
import McButton from "components/mc-button";
import useState from "hooks/useState";
import useDrop from "./useDrop";
import McDocViewer from "./docx";

interface IProps {
  docs: IScanImage[];
  loading?: boolean;
  onScan?: (image: IScanImage) => void;
  onChange?: (images: IScanImage[]) => void;
}

const McDocxViewer: FC<IProps> = ({ docs, loading = false, onScan, onChange }) => {
  const [data, setData, setProp] = useState<McDocxData>({
    docs,
    active: 0,
  });
  const drop = useDrop(setData);

  useEffect(() => {
    if (onChange) {
      onChange(data.docs);
    }
  }, [data.docs, onChange]);

  useEffect(() => {
    setProp("docs")(docs);
  }, [docs, setProp]);

  return (
    <div className="mc-docx-viewer">
      <div className="mc-docx-viewer__inner">
        <McDocViewer
          active={data.active}
          docs={data.docs}
          onPrev={index => setProp("active")(index)}
          onNext={index => setProp("active")(index)}
        />
      </div>
      <div className="mc-docx-viewer__menu">
        <McButton
          icon="delete"
          type="primary"
          danger
          disabled={data.docs.length <= 0}
          onClick={() => drop(data.docs[data.active])}
        >
          删除
        </McButton>
        {onScan && (
          <McButton
            disabled={data.docs.length <= 0}
            icon="send"
            type="primary"
            loading={loading}
            onClick={() => onScan && onScan(data.docs[data.active])}
          >
            识别
          </McButton>
        )}
      </div>
    </div>
  );
};

export default McDocxViewer;

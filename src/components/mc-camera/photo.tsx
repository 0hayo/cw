import React, { FC } from "react";
import McIcon from "components/mc-icon";
import { Button } from "antd";
import { useHistory } from "react-router";

interface IProps {
  mode: "photo" | "video" | "docx";
  active: number;
  images: IScanImage[];
  onPrev?: (index: number) => void;
  onNext?: (index: number) => void;
  onTake?: () => void;
}

const McPhoto: FC<IProps> = ({ mode, active, images, onPrev, onNext, onTake }) => {
  const history = useHistory();

  return (
    <div className="mc-camera__photo">
      <div className="mc-camera__photo-inner">
        <div className="mc-camera__photo-name">{images[active]?.name}</div>
        {images.length > 0 ? (
          <img alt="preview" src={images[active]?.url} className="mc-camera__photo-image" />
        ) : (
          <div className="mc-choose">
            <h2 style={{ color: "#0091ff" }}>没有图像，请选择：</h2>
            <Button type="primary" onClick={() => onTake && onTake()}>
              <span>拍照识别</span>
              <McIcon>camera</McIcon>
            </Button>
            <Button type="primary" onClick={() => history.push("/files/import")}>
              <span>文件识别</span>
              <McIcon>file-select</McIcon>
            </Button>
          </div>
        )}
      </div>
      {images.length > 0 && (
        <>
          <div
            className="mc-camera__photo-prev"
            onClick={() => onPrev && onPrev(Math.max(0, active - 1))}
          >
            <McIcon size="33px" color="#32C5FF">
              prev
            </McIcon>
          </div>
          <div
            className="mc-camera__photo-next"
            onClick={() => onNext && onNext(Math.min(active + 1, images.length - 1))}
          >
            <McIcon size="33px" color="#32C5FF">
              next
            </McIcon>
          </div>
          <div className="mc-camera__photo-page">
            {active + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

export default McPhoto;

import "./index.less";
import McPhoto from "./photo";
import McVideo from "./video";
import useTake from "./useTake";
import useDrop from "./useDrop";
import useGuid from "hooks/useGuid";
import useState from "hooks/useState";
import { McCameraData } from "./typing";
import McButton from "components/mc-button";
import McIconButton from "components/mc-icon-button";
import React, { FC, useEffect } from "react";

interface IProps {
  mode: "photo" | "video" | "docx";
  images: IScanImage[];
  loading?: boolean;
  onTake?: (image: IScanImage) => void;
  onScan?: (image: IScanImage) => void;
  onDrop?: (image: IScanImage) => void;
  onChange?: (images: IScanImage[]) => void;
}

const McCamera: FC<IProps> = ({
  mode,
  images,
  loading = false,
  onTake,
  onScan,
  onDrop,
  onChange,
}) => {
  const [data, setData, setProp] = useState<McCameraData>({
    mode,
    images,
    active: 0,
  });
  const uuid = useGuid();
  const drop = useDrop(setData, onDrop);
  const [rotate, setRotate] = useState(90);
  const take = useTake(uuid, setData, onTake);
  const [containerW, setContainerW] = useState(0);
  const scale = 16 / 10;

  useEffect(() => {
    if (onChange) {
      onChange(data.images);
    }
  }, [data.images, onChange]);

  useEffect(() => {
    setProp("images")(images);
  }, [images, setProp]);

  useEffect(() => {
    const container = document.getElementById("mc-camera-" + uuid);
    if (container) {
      setContainerW(container.offsetWidth);
    }
  }, [uuid]);

  return (
    <div className="mc-camera">
      <div id={"mc-camera-" + uuid} className="mc-camera__inner">
        {data.mode === "photo" ? (
          <McPhoto
            mode={data.mode}
            active={data.active}
            images={data.images}
            onPrev={index => setProp("active")(index)}
            onNext={index => setProp("active")(index)}
            onTake={() => setProp("mode")("video")}
          />
        ) : (
          <McVideo uuid={`mc-${uuid}`} scale={scale} rotate={rotate} containerW={containerW} />
        )}
      </div>

      {data.mode === "photo" ? (
        <div className="mc-camera__menu">
          <McButton
            icon="delete"
            type="primary"
            danger
            disabled={!data.images || data.images.length <= 0}
            onClick={() => {
              drop(data.images[data.active]);
              onDrop && onDrop(data.images[data.active]);
            }}
          >
            删除
          </McButton>
          {onScan && (
            <McButton
              icon="send"
              type="primary"
              loading={loading}
              disabled={!data.images || data.images.length <= 0}
              onClick={() => onScan && onScan(data.images[data.active])}
            >
              识别
            </McButton>
          )}
          <McButton icon="plus" type="primary" onClick={() => setProp("mode")("video")}>
            新增
          </McButton>
        </div>
      ) : (
        <div className="mc-camera__menu">
          <McButton
            icon="camera"
            type="primary"
            onClick={() => {
              take(rotate);
            }}
          >
            拍照
          </McButton>
          {/* <McButton
            onClick={()=> (setScale(scale + 0.05))}
          >
            +
          </McButton> */}
          <McIconButton onClick={() => setRotate(rotate + 90)} style={{ fontSize: 32 }}>
            rotate
          </McIconButton>
          {/* <McButton
            onClick={()=> (setScale(scale - 0.05))}
          >
            -
          </McButton> */}
          <McButton
            icon="photo"
            type="primary"
            // disabled={data.images.length === 0}
            onClick={() => setProp("mode")("photo")}
          >
            返回
          </McButton>
        </div>
      )}
    </div>
  );
};

export default McCamera;

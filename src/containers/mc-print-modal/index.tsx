import "./index.less";
import usePrint from "./userPrint";
import useGuid from "hooks/useGuid";
import McBox from "components/mc-box";
import McModal from "components/mc-modal";
import McButton from "components/mc-button";
// import McTmplPicker from "containers/mc-tmpl-picker";
import React, { FC, useCallback, useState, useEffect } from "react";
// import { Switch } from "antd";
// import html2canvas from "html2canvas";
import McLoading from "components/mc-loading";
// import McTmplPicker from "../mc-tmpl-picker";

interface IProps {
  visible: boolean;
  templates?: boolean;
  tmplName?: string;
  type: TelegramBizType;
  onChangeTmpl?: (name: string) => void;
  callback: () => void;
}

const McPrintModal: FC<IProps> = ({
  visible,
  templates = false,
  tmplName = "训练报",
  type = "CW",
  onChangeTmpl,
  callback,
  children,
}) => {
  const guid = useGuid();
  const print = usePrint(guid);
  // const [currTmplName, setCurrTmplName] = useState(tmplName);
  const [crude, setCrude] = useState(true);
  const [height, setHeight] = useState(1600);
  const [loading, setLoading] = useState(true);
  const el = document.getElementById("print-area");

  useEffect(() => {
    setLoading(true);
    el && setHeight(el.clientHeight * 1.8);
    setLoading(false);
  }, [visible, children, el, guid]);

  // const canvasImg = () => {
  //   const canvasEle: any = document.getElementById(`mc-print-content-${guid}`); //获取元素

  //   html2canvas(canvasEle, {
  //     width: canvasEle?.clientWidth + 60, //设置canvas的宽度
  //     height: height + 100,
  //     scale: 1, //缩放
  //   }).then(canvas => {
  //     //处理生成的canvas
  //     // document.body.appendChild(canvas);
  //     const a = document.createElement("a");
  //     a.setAttribute("href", canvas.toDataURL()); //toDataUrl：将canvas画布信息转化为base64格式图片
  //     a.setAttribute("download", "报文导出"); //这个是必须的，否则会报错
  //     a.setAttribute("target", "_self");
  //     a.click();
  //   });
  // };

  const doPrint = useCallback(async () => {
    print();
    callback();
  }, [callback, print]);

  const cancel = useCallback(async () => {
    callback();
    setCrude(true);
  }, [callback]);

  useEffect(() => {
    const crudeCells = document.getElementsByClassName("mc-crude-content");
    const display = crude ? "block" : "none";

    for (let i = 0; i < crudeCells.length; i++) {
      const element = crudeCells[i];
      const style = element.getAttribute("style");
      let newStyle = "display: " + display;
      newStyle = style
        ? style.replace("display: block", "").replace("display: none", "") + newStyle
        : newStyle;
      element.setAttribute("style", newStyle);
    }
  }, [crude]);

  // const [hh] = useState<number>(4096);

  return (
    <McModal
      visible={visible}
      width="400mm"
      footer={null}
      closable={false}
      maskClosable={false}
      destroyOnClose={true}
      className="mc-print-modal"
      style={{ top: 30 }}
      bodyStyle={{ backgroundColor: "#f5f5f5" }}
    >
      {/*<McBox minHeight="4096mm">*/}
      <div style={{ height: "fit-content" }}>
        <div className="mc-print-modal__menu">
          <div className="mc-print-modal__title">打印报文</div>
          {templates && (
            <div>
              <McBox width="280px" position="relative" marginRight="24px">
                {/*<span>请选择电报格式: </span>*/}
                {/*<McTmplPicker*/}
                {/*  name={currTmplName}*/}
                {/*  type={type}*/}
                {/*  onChange={value => {*/}
                {/*    setCrude(true);*/}
                {/*    // alert(value);*/}
                {/*    // setCurrTmplName(value);*/}
                {/*    // onChangeTmpl && onChangeTmpl(value);*/}
                {/*    setCurrTmplName("训练报");*/}
                {/*    onChangeTmpl && onChangeTmpl("训练报");*/}
                {/*  }}*/}
                {/*/>*/}
              </McBox>
            </div>
          )}
          {/* <div>
            <McBox width="180px" position="relative" marginRight="24px">
              <span>校报对比: </span>
              <Switch
                title="是否打印校报对比？"
                defaultChecked={true}
                checked={crude}
                onClick={checked => setCrude(checked)}
                style={{ border: "2px solid #0091ff" }}
              />
            </McBox>
          </div> */}
          <div style={{ display: "flex", flexDirection: "row", marginLeft: "auto" }}>
            <McButton icon="printer" type="primary" onClick={doPrint}>
              打印
            </McButton>
            {/* <McButton type="primary" onClick={canvasImg}>
              导出图片
            </McButton> */}
            <McButton type="primary" onClick={cancel}>
              取消
            </McButton>
          </div>
        </div>
        <hr className={"no-print"} />
        <div
          id={`mc-print-content-${guid}`}
          style={{ marginTop: "15mm", paddingLeft: "10mm", paddingRight: "20mm", height: height }}
        >
          {children}
        </div>
      </div>
      {loading && (
        <McLoading position="fixed" top={-80} left="48%">
          正在生成打印页面
        </McLoading>
      )}
    </McModal>
  );
};

export default McPrintModal;

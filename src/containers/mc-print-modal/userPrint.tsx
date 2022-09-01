import { ipcRenderer } from "electron";
import { Modal } from "antd";
import { useCallback } from "react";

const usePrint = function (guid: string): () => void {
  const print = useCallback(() => {
    return new Promise(resolve => {
      const el = document.getElementById(`mc-print-content-${guid}`) as HTMLDivElement;

      const printArea = document.getElementById("print-area") as HTMLDivElement;
      printArea.setAttribute("style", "");

      ipcRenderer.once("did-print", (_, result, reason) => {
        if (result === false && reason !== "cancelled") {
          Modal.error({
            title: "发生错误",
            content: `打印失败: ${JSON.stringify(reason)}`,
          });
        }
        resolve(result);
      });

      ipcRenderer.send("new-print", el?.innerHTML);
    });
  }, [guid]);

  return print;
};

export default usePrint;

import { Socket } from "net";
import exec from "services/exec";
import message from "misc/message";
import useMounted from "hooks/useMounted";
import { useCallback, MutableRefObject } from "react";
import cwIForm from "pages/cw/form";

const useSender = (
  socket: MutableRefObject<Socket | undefined>
): {
  chatCmd: (text: string, cwIForm?: cwIForm) => void;
} => {
  const mounted = useMounted();

  const chatCmd = useCallback(
    (text: string, cwForm?: cwIForm) => {
      // setForm(form => {
      // if (socket.current) {
      //   socket.current.end();
      // }
      const sendText = text.replace("Ü", "@");
      // cwForm.activeRadio?.ip &&
      socket.current = exec(
        // `{"cmd":"ctConnect","radioCode":"10001"} \r\n morse-tx -speed ${form.speed} -raw ${sendText}`,
        // `morse-tx -speed ${form.speed} -raw ${sendText}`,
        `morse-setup ${sendText}`,
        // `morse-tx -speed recv -raw ${sendText}`,
        {
          onData: payload => {
            // if (mounted.current) {
            //   if (payload.tag === "Error") {
            //     message.failure("智能收报", payload.message);
            //     return;
            //   }
            //   if (payload.tag === "TxResult") {
            //     //将己方发送的短语，回显到feed格子里，以便观测发送进度
            //     console.log("RX Sender, TxResult:", JSON.stringify(payload));
            //     // {"tag":"PhyStatus","snr":11.567533596135995,"amp":13474.69349189458,"freq":997.0654564322592,"signalDetected":false,"snrThreshold":2.0,"ampThreshold":50000.0}
            //     // {"tag":"TxResult","timestamp":1620446031941,"text":"VVV 1234 DE 5678 K?","speed":80,"storage":{"tag":"AudioDataStorage","fileName":"/home/mst/.morsed/session/SZT-MAT-0000-20210508-115337-TX/tx.raw","offset":0,"length":258048},"rc":0,"progress":100,"nrCharsSent":19}
            //
            //     const message = parser.tx(payload);
            //     setForm(it => (
            //         {
            //           ...it,
            //           feed: payload.progress === 100 ? DUMB_FEED : message,
            //           progress: payload.progress,
            //           transmit: payload.progress === 100 ? false : true,
            //
            //         }
            //     ));
            //   } else {
            //   }
            // }
          },
          onReady: () => {
            if (mounted.current) {
              // setForm(x => ({
              //   ...x,
              //   feed: DUMB_FEED,
              //   progress: 0,
              //   transmit: true,
              // }));
            }
          },
          onClose: () => {
            // if (mounted.current) {
            //   setForm(x => {
            //     const feed = x.feed;
            //     if (feed && feed.complete) {
            //       return {
            //         ...x,
            //         feed: DUMB_FEED,
            //         transmit: false,
            //       };
            //     } else if (feed && !feed.complete) {
            //       return {
            //         ...x,
            //         messages: [
            //           ...x.messages,
            //           {
            //             ...feed,
            //             value: feed.value,
            //             canceled: true,
            //             complete: true,
            //           },
            //         ],
            //         feed: DUMB_FEED,
            //         transmit: false,
            //       };
            //     } else {
            //       return {
            //         ...x,
            //         transmit: false,
            //         ui: {
            //           ...x.ui,
            //           prepare: false,
            //         },
            //       };
            //     }
            //   });
            // }
          },
          onError: () => {
            if (mounted.current) {
              message.failure("智能收报", "连接错误");
            }
          },
        }
        // ,
        // cwForm?.activeRadio?.ip
      );

      // return form;
      // });
    },
    [socket, mounted]
  );

  return {
    chatCmd,
  };
};

export default useSender;

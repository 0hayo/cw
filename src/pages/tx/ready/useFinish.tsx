import { IForm } from "./typing";
import message from "misc/message";
import xchat from "services/xchat";
import { useCallback, SetStateAction, Dispatch, useMemo } from "react";
import xsession from "services/xsession";
import guid from "misc/guid";
import service from "./service";
import cwIForm from "pages/cw/form";
import fetch from "utils/fetch";
import { useLocation } from "react-router";
import qs from "query-string";
import xdatagram from "services/xdatagram";
import { getAppType, getControlRadio, LOCAL_MACHINE_ID } from "misc/env";
import moment from "moment";

const useFinish = (
  setForm: Dispatch<SetStateAction<IForm>>,
  finish?: VoidFunction
): ((form: IForm, cwForm?: cwIForm, finish?: VoidFunction) => void) => {
  // const history = useHistory();
  const location = useLocation();
  // console.log("location.search", location.search);
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  // const uuid = search.datagramDraftUuid as string;
  // const dir = uuid ? uuid : (search.dir as string);
  const taskUuid = search.taskUuid != null ? search.taskUuid : null;

  const { radioUuid } =
    getAppType() === "control" ? getControlRadio() : { radioUuid: LOCAL_MACHINE_ID };
  const handler = useCallback(
    async (form: IForm, cwForm: cwIForm) => {
      if (form.dir) {
        try {
          // alert(form.contactTableId);
          const basename = guid();

          //是否从电子报底首次加载？
          // const first = form.dir.indexOf("/draft/") > 0;
          // const basename = first ? guid() : path.basename(form.dir);
          // const basename = guid();
          // const savedir = path.join(kWorkFiles, "sent", basename);

          //更新发送状态
          await xdatagram.saveServer(basename, radioUuid, form.name, 1, true, "none", "M", 0);

          // alert(form.name);
          //保存新的报文信息（因为有可能会修改）、meta信息
          service.saveServer({
            dir: basename,
            type: form.type,
            head: form.head,
            body: form.body,
            name: form.name,
            ptime: form.pdate,
            stime: form.sdate,
            finish: form.finish,
            cwForm: cwForm,
          });

          console.log("session=", form.session);
          // 会话信息
          if (form.session) {
            // await xsession.save(savedir, form.session);
            await xsession.saveServer(basename, form.session);
          }
          // 沟通信息
          if (form.messages.length) {
            // await xchat.save(savedir, form.messages);
            await xchat.saveServer(basename, form.messages);
          }

          if (taskUuid) {
            // const now = Date.now();
            // basename = dir;
            const param = {
              datagrams: [
                {
                  title: "临时任务",
                  type: "1",
                  uuid: basename,
                },
              ],
              id: taskUuid,
              // name: form.name,
              type: "1",
              contactTableId: form.contactTableId,
              updatedAt: moment(form.date).format("YYYY-MM-DD HH:mm:ss") + "",
              starTime: Date.now() + " ",
            };
            const { data } = await fetch.put<ManageResponse>(
              "/sysTask/update",
              JSON.stringify(param)
            );
            // if (!data.data) {
            //   return;
            // }
            // alert(data.data.id);
            setForm(x => ({
              ...x,
              taskid: data.data?.id + "",
            }));
            // await fetch.put<MstResponse>("/sysTask/complete/" + radioUuid + "/" + taskUuid);
            // await fetch.put<MstResponse>("/sysTask/complete/" + taskUuid);
            await fetch.put<MstResponse>(`/sysTask/complete/${taskUuid}?radioUuid=${radioUuid}`);
          }
          // if (!taskUuid && dir) {
          else {
            const param = {
              datagrams: [
                {
                  title: "临时任务",
                  type: "1",
                  uuid: basename,
                },
              ],
              // name: dir,
              contactTableId: form.contactTableId,
              name: moment(Date.now()).format("YYYY年MM月DD日") + "发送任务",
              type: "1",
              updatedAt: moment(form.date).format("YYYY-MM-DD HH:mm:ss") + "",
              startTime: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") + "",
            };
            // alert("1");
            const { data } = await fetch.post<ManageResponse>(
              "/sysTask/insert",
              JSON.stringify(param)
            );
            if (!data.data) {
              return;
            }
            setForm(x => ({
              ...x,
              taskid: data.data?.id + "",
            }));
            // await fetch.put<MstResponse>("/sysTask/complete/" + radioUuid + "/" + data.data.id);
            // await fetch.put<MstResponse>("/sysTask/complete/" + data.data.id);
            await fetch.put<MstResponse>(
              `/sysTask/complete/${data.data.id}?radioUuid=${radioUuid}`
            );
          }

          // if (form.ui.exit) {
          //   history.push("/tx?silent=1");
          // } else
          // {
          setForm(x => ({
            ...x,
            ui: {
              ...x.ui,
              save: false,
            },
          }));
          // }
        } catch (ex) {
          console.error(ex);
          message.failure("保存发报记录错误", ex.message || ex.toString());
        }

        // finish();
      }
    },
    // eslint-disable-next-line
    [setForm]
    // []
  );

  return handler;
};

export default useFinish;
